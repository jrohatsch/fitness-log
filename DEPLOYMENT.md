# Deployment Guide - GitHub Pages

This project is configured to automatically deploy to GitHub Pages whenever you push to the `main` branch.

## Setup Instructions

### 1. Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - The deploy workflow will automatically run and deploy to GitHub Pages

### 2. Trigger First Deployment

The workflow will automatically run when you:
- Push to the `main` branch
- Or manually trigger it via **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

### 3. Access Your App

Your app will be available at: `https://YOUR_USERNAME.github.io/fitness-log/`

(Replace `YOUR_USERNAME` with your GitHub username)

## How It Works

The deployment workflow:

1. **Builds** the SvelteKit app with the static adapter
2. **Generates** static HTML files in the `build/` directory
3. **Uploads** the build artifacts to GitHub Pages
4. **Deploys** automatically to your GitHub Pages site

### Build Configuration

- **Adapter**: `@sveltejs/adapter-static` - generates static HTML files
- **Output**: `build/` directory
- **Entry point**: `index.html` (single-page app fallback)

### Key Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow configuration
- `svelte.config.js` - SvelteKit configuration with static adapter
- `static/.nojekyll` - Tells GitHub Pages to not process Jekyll

## Local Testing

Test the production build locally before pushing:

```bash
npm run build
npm run preview
```

Then open `http://localhost:4173` in your browser.

## Troubleshooting

### Pages not deploying?
- Check the **Actions** tab in your repository for workflow errors
- Ensure you've pushed to the `main` branch
- Verify GitHub Pages is set to "GitHub Actions" as the source

### Stale content displayed?
- Clear your browser cache
- GitHub Pages may cache for a few minutes
- Try accessing in an incognito/private window

### Data not persisting across page reloads?
This is expected! The app uses browser localStorage for data, which is isolated per site.

Since GitHub Pages uses the project name in the URL (`/fitness-log/`), localStorage is specific to that path. Your data will persist as long as you:
- Don't clear browser cache
- Stay on the same GitHub Pages URL

For a production app, consider adding cloud sync or exporting/importing data as TSV.

## Deployment Status

Check the deployment status:
1. Go to your repository
2. Click **Actions** tab
3. Look for "Deploy to GitHub Pages" workflow runs
4. Green checkmark = successful deployment
5. Red X = deployment failed (check the logs)

## Custom Domain (Optional)

To use a custom domain:
1. In **Settings** → **Pages**, add your custom domain
2. Update your domain's DNS records to point to GitHub Pages
3. See [GitHub Pages docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for details
