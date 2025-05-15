# Deployment Instructions

This Next.js application is configured for easy deployment to Vercel.

## Prerequisites
- Vercel account (free at vercel.com)
- Git repository pushed to GitHub

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import Git Repository
   - Connect your GitHub account if not already connected
   - Search for `nextjs-starburst99-app`
   - Select the repository
4. Configure Project
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: Leave as is (root)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
5. Environment Variables
   - Add: `DISABLE_QUEUE_MANAGER` = `true`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```
   Choose your preferred login method (GitHub recommended)

3. Deploy:
   ```bash
   cd "/Users/beardoggy/Desktop/2024 WorkSpace/Project Pegasus/Contributor B/quality-issue"
   vercel --prod
   ```

4. Follow the prompts:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No (first time) or Yes (subsequent deploys)
   - Project name: `nextjs-starburst99-app`
   - In which directory is your code located? `.` (current directory)
   - Want to override the settings? No

### Option 3: Deploy via Git Integration

1. Push your code to GitHub (already done)
2. Connect GitHub repository to Vercel:
   - Go to Vercel Dashboard
   - Settings > Git
   - Connect GitHub repository
3. Enable automatic deployments:
   - Every push to main branch will trigger a deployment
   - Pull requests get preview deployments

## Environment Variables

The application requires these environment variables in Vercel:

- `DISABLE_QUEUE_MANAGER`: Set to `true` to disable the job queue system

## Post-Deployment

After deployment, you'll get:
- Production URL: `https://nextjs-starburst99-app.vercel.app`
- Preview URLs for pull requests
- Automatic HTTPS
- Global CDN distribution

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set correctly
4. Check Node.js version compatibility

## Custom Domain

To add a custom domain:
1. Go to Vercel Dashboard > Settings > Domains
2. Add your domain
3. Update DNS records as instructed