@AGENTS.md

## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel
- Production URL: https://rapt-three.vercel.app
- Deploy workflow: auto-deploy on push to main
- Deploy status command: HTTP health check
- Merge method: merge
- Project type: web app (Next.js)
- Post-deploy health check: https://rapt-three.vercel.app

### Custom deploy hooks
- Pre-merge: none
- Deploy trigger: automatic on push to main
- Deploy status: poll production URL
- Health check: https://rapt-three.vercel.app
