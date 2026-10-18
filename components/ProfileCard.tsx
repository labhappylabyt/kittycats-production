'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { incrementTreatCount } from '@/app/actions';
import { Icon } from '@iconify/react';
import chatBubbleIcon from '@iconify-icons/streamline/mail-chat-bubble-square-messages-message-bubble-chat-square';
import cameraIcon from '@iconify-icons/streamline/image-camera-1-photos-picture-camera-photography-photo-pictures';
import codeIcon from '@iconify-icons/streamline/programming-browser-code-1-code-browser-line-shell-programming-command-terminal';
import twitterIcon from '@iconify-icons/streamline/computer-logo-twitter-media-twitter-social';
import youtubeIcon from '@iconify-icons/streamline/computer-logo-youtube-youtube-clip-social-video';
import linkedinIcon from '@iconify-icons/streamline/computer-logo-linkedin-network-linkedin-professional';
import mailIcon from '@iconify-icons/streamline/mail-send-envelope-envelope-email-message-unopened-sealed-close';
import leafIcon from '@iconify-icons/streamline/nature-ecology-leaf-environment-leaf-ecology-plant-plants-eco';

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  orderIndex: number;
}

interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  treatCount: number;
  Link: Link[];
}

// Map link titles to Streamline icons. The data is imported rather than looked
// up by name, so nothing is fetched from api.iconify.design at runtime — and
// the six names this used to return ('chat-bubble-dots', 'camera', 'code',
// 'bird', 'play', 'mail') don't exist in the set, so they rendered blank.
const getLinkIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('discord')) return chatBubbleIcon;
  if (lowerTitle.includes('instagram')) return cameraIcon;
  if (lowerTitle.includes('github')) return codeIcon;
  if (lowerTitle.includes('twitter') || lowerTitle.includes('x')) return twitterIcon;
  if (lowerTitle.includes('youtube')) return youtubeIcon;
  if (lowerTitle.includes('linkedin')) return linkedinIcon;
  if (lowerTitle.includes('email') || lowerTitle.includes('mail')) return mailIcon;
  // Default nature icon
  return leafIcon;
};

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [treatCount, setTreatCount] = useState(profile.treatCount);
  const [isTreatAnimation, setIsTreatAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current);
    };
  }, []);

  const handleFeedTreat = async () => {
    setIsTreatAnimation(true);
    if (animationTimer.current) clearTimeout(animationTimer.current);
    animationTimer.current = setTimeout(() => setIsTreatAnimation(false), 1500);

    try {
      const result = await incrementTreatCount(profile.username);
      if (result.success) {
        // The database is the authority on the count, not the click.
        setTreatCount(result.treatCount);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Could not reach the treat jar. Try again in a moment.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-[200px] bg-surface backdrop-blur-md border-2 border-dashed border-pink-200 rounded-3xl p-6 max-w-2xl mx-auto"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        {profile.avatarUrl ? (
          <motion.img
            src={profile.avatarUrl}
            alt={`${profile.displayName || profile.username}'s avatar`}
            width={96}
            height={96}
            loading="lazy"
            className="w-24 h-24 rounded-full border-2 border-pink-200 object-cover"
            whileTap={{ scale: 0.98 }}
          />
        ) : (
          <motion.div
            className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center"
            whileTap={{ scale: 0.98 }}
          >
            {/* Initials */}
            <span className="text-pink-800 font-medium">
              {(profile.displayName || profile.username)
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </motion.div>
        )}

        {/* Username and Display Name */}
        <div>
          <p className="text-2xl font-bold text-pink-800">
            @{profile.username}
          </p>
          {profile.displayName && (
            <p className="text-lg text-pink-700">{profile.displayName}</p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-pink-700 max-w-2xl">{profile.bio}</p>
        )}

        {/* Feed Treat Button */}
        <motion.button
          type="button"
          onClick={handleFeedTreat}
          className="mt-4 px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 backdrop-blur-sm border border-pink-500/30 rounded-full text-pink-700 hover:text-pink-800 transition-all duration-300 flex items-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <span aria-hidden="true">🐟</span> Feed Treat
          <span className="bg-pink-500/30 rounded-full px-2 py-0.5 text-xs">
            {treatCount}
          </span>
        </motion.button>

        {/* Social Links */}
        <div className="mt-6 w-full space-y-3">
          {profile.Link.map(link => (
            <motion.div
              key={link.id}
              className="flex items-center px-4 py-3 bg-white/40 border border-pink-200 rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Streamline Icon */}
              <div className="flex-shrink-0">
                <Icon
                  icon={getLinkIcon(link.title)}
                  width={20}
                  height={20}
                  className="text-pink-700"
                />
              </div>
              {/* Link Info */}
              <div className="ml-3 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-pink-800 hover:text-pink-700 transition-colors font-medium"
                >
                  {link.title}
                </a>
                <p className="text-xs text-pink-700 break-all">{link.url}</p>
              </div>
            </motion.div>
          ))}
          {!profile.Link.length && (
            <p className="text-pink-700 text-center py-4">No links yet</p>
          )}
        </div>

        {/* Interactive Treat Button with Cottagecore Animation */}
        <motion.button
          type="button"
          onClick={handleFeedTreat}
          className={`relative w-full mt-5 px-5 py-3 bg-pink-500/20 hover:bg-pink-500/30 backdrop-blur-sm border border-pink-500/30 rounded-xl text-pink-700 hover:text-pink-800 transition-all duration-300 flex items-center justify-center gap-3 ${
            isTreatAnimation ? 'motion-safe:animate-pulse' : ''
          }`}
          whileTap={{ scale: 0.97, rotate: -2 }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl" aria-hidden="true">🍯</span>
            <span className="font-medium">Offer a Treat</span>
          </div>
          <span
            aria-live="polite"
            aria-label={`${treatCount} treats`}
            className="bg-pink-500/30 rounded-full px-2 py-0.5 text-xs"
          >
            {treatCount}
          </span>
          <div className="absolute -right-4 -bottom-4 text-pink-300 text-xs" aria-hidden="true">
            💫
          </div>
        </motion.button>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
