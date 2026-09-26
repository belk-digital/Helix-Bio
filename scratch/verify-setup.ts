import { config } from 'dotenv'

// Existing env vars (e.g. the blanked RESEND_API_KEY) win over the file.
config({ path: '.env.local' })
