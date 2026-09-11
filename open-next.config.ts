import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'

// Build commands are now owned by the package scripts; adapter-specific overrides
// remain intentionally empty to preserve the default Cloudflare runtime behavior.
export default defineCloudflareConfig()
