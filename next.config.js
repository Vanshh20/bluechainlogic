/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Environment variables required for onboarding system:
     N8N_VALIDATE_WEBHOOK - n8n webhook URL for token validation
     N8N_SUBMIT_WEBHOOK   - n8n webhook URL for form submission
     Set these in Vercel → Settings → Environment Variables */
};
module.exports = nextConfig;
