'use client'

import { useEffect, useState } from 'react'
import { presence as config, type PresenceStatus } from '@/config/site'

export type Activity = {
  name: string
  details: string | null
  state: string | null
  image: string | null
}

export type Spotify = {
  song: string
  artist: string
  album: string
  albumArt: string
  /** epoch ms */
  start: number
  end: number
}

export type PresenceState = {
  status: PresenceStatus
  activity: Activity | null
  spotify: Spotify | null
  /** 0–1 through the current Spotify track */
  spotifyProgress: number
  /** Discord CDN avatar, when Lanyard reports one */
  avatarUrl: string | null
}

const STATUSES: PresenceStatus[] = ['online', 'idle', 'dnd', 'offline']

const OFFLINE: PresenceState = {
  status: 'offline',
  activity: null,
  spotify: null,
  spotifyProgress: 0,
  avatarUrl: null,
}

type RawActivity = {
  type: number
  name: string
  details?: string | null
  state?: string | null
  application_id?: string
  assets?: { large_image?: string }
}

type RawPresence = {
  discord_user?: { id?: string; avatar?: string | null }
  discord_status?: string
  activities?: RawActivity[]
  spotify?: {
    song: string
    artist: string
    album: string
    album_art_url: string
    timestamps: { start: number; end: number }
  } | null
}

/** Discord asset refs come in two forms; both need rewriting to a CDN URL. */
function assetUrl(image: string | undefined, applicationId: string | undefined) {
  if (!image) return null
  if (image.startsWith('mp:')) return `https://media.discordapp.net/${image.slice(3)}`
  if (!applicationId) return null
  return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`
}

/**
 * Lanyard's payload → the shape the UI wants. Exported because it is the only
 * branchy part of this hook and the one worth checking against a live payload.
 */
export function parsePresence(raw: RawPresence): PresenceState {
  const status = STATUSES.includes(raw.discord_status as PresenceStatus)
    ? (raw.discord_status as PresenceStatus)
    : 'offline'

  const activities = raw.activities ?? []
  // Type 4 is a custom status ("my mood") — no image, and it reads as filler
  // next to a real activity, so a real one wins when both are present.
  const act = activities.find((a) => a.type !== 4) ?? activities[0]

  const user = raw.discord_user
  const avatarUrl =
    user?.id && user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : null

  return {
    status,
    activity: act
      ? {
          name: act.name,
          details: act.details ?? null,
          state: act.state ?? null,
          image: assetUrl(act.assets?.large_image, act.application_id),
        }
      : null,
    spotify: raw.spotify
      ? {
          song: raw.spotify.song,
          artist: raw.spotify.artist,
          album: raw.spotify.album,
          albumArt: raw.spotify.album_art_url,
          start: raw.spotify.timestamps.start,
          end: raw.spotify.timestamps.end,
        }
      : null,
    spotifyProgress: 0,
    avatarUrl,
  }
}

/** How often REST is polled while the socket is down. */
const POLL_MS = 30_000

/**
 * Live Discord presence over Lanyard.
 *
 * One REST read up front so the card is truthful on first paint, then the
 * socket for updates. If the socket drops, REST polling takes over rather than
 * leaving a stale card — and the retry backs off so a Lanyard outage doesn't
 * turn into a reconnect storm.
 */
export function usePresence(): PresenceState {
  const [state, setState] = useState<PresenceState>(OFFLINE)
  const [now, setNow] = useState(0)

  useEffect(() => {
    let socket: WebSocket | null = null
    let heartbeat: ReturnType<typeof setInterval> | null = null
    let poll: ReturnType<typeof setInterval> | null = null
    let retry: ReturnType<typeof setTimeout> | null = null
    let closed = false
    let attempts = 0

    const apply = (raw: RawPresence) => setState(parsePresence(raw))

    const stopPolling = () => {
      if (poll) {
        clearInterval(poll)
        poll = null
      }
    }

    const fetchRest = async () => {
      try {
        const res = await fetch(`${config.rest}/${config.discordId}`)
        const json = (await res.json()) as { success?: boolean; data?: RawPresence }
        if (!closed && json.success && json.data) apply(json.data)
      } catch {
        /* network hiccup — the socket or the next poll catches up */
      }
    }

    const connect = () => {
      if (closed) return
      try {
        socket = new WebSocket(config.socket)
      } catch {
        return
      }

      socket.onmessage = (event) => {
        let msg: { op: number; d?: unknown }
        try {
          msg = JSON.parse(event.data as string)
        } catch {
          return
        }

        if (msg.op === 1) {
          const hello = msg.d as { heartbeat_interval: number }
          socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: config.discordId } }))
          if (heartbeat) clearInterval(heartbeat)
          heartbeat = setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ op: 3 }))
          }, hello.heartbeat_interval)
        } else if (msg.op === 0) {
          attempts = 0
          stopPolling()
          apply(msg.d as RawPresence)
        }
      }

      socket.onclose = () => {
        if (heartbeat) {
          clearInterval(heartbeat)
          heartbeat = null
        }
        if (closed) return
        if (!poll) poll = setInterval(fetchRest, POLL_MS)
        retry = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempts++))
      }

      socket.onerror = () => socket?.close()
    }

    void fetchRest()
    connect()

    return () => {
      closed = true
      if (heartbeat) clearInterval(heartbeat)
      if (retry) clearTimeout(retry)
      stopPolling()
      socket?.close()
    }
  }, [])

  const spotify = state.spotify
  useEffect(() => {
    if (!spotify) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [spotify])

  if (!spotify || now === 0 || spotify.end <= spotify.start) return state

  const progress = (now - spotify.start) / (spotify.end - spotify.start)
  return { ...state, spotifyProgress: Math.max(0, Math.min(1, progress)) }
}
