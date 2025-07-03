# Deployment Guide - My Phim V4

This guide covers multiple deployment options for the My Phim V4 Next.js movie streaming application.

## Prerequisites

- Node.js 18 or later
- npm or yarn package manager
- Git

## Quick Local Testing

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Deployment Options

### 1. Vercel (Recommended - Easiest)

Vercel is the easiest option for deploying Next.js applications:

#### Option A: Deploy via Git
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect Next.js and deploy

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (run from project root)
vercel

# Follow the prompts to configure deployment
```

**Configuration**: The `vercel.json` file is already configured with optimal settings.

### 2. Netlify

1. Build the application:
   ```bash
   npm run build
   ```
2. Upload the `.next` folder to Netlify
3. Or connect your Git repository to Netlify for automatic deployments

### 3. Docker Deployment

#### Build Docker Image
```bash
# Build the image
docker build -t my-phim-v4 .

# Run the container
docker run -p 3000:3000 my-phim-v4
```

#### Using Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

### 4. Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### 5. Render

1. Connect your Git repository to [Render](https://render.com)
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18

### 6. DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create a new app from your Git repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

### 7. Heroku

1. Install Heroku CLI
2. Create Heroku app:
   ```bash
   heroku create my-phim-v4
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

## 🔧 Environment Configuration

### Required Environment Variables
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Optional Environment Variables
```env
# Custom API endpoints (if needed)
API_BASE_URL=https://phimapi.com

# Custom domain configuration
NEXTAUTH_URL=https://yourdomain.com
```

## 🛠️ Build Optimization

### Performance Optimizations
The application is configured with:
- ✅ Image optimization
- ✅ Bundle optimization
- ✅ Standalone output for Docker
- ✅ External API domain allowlisting

### Known Issues & Fixes
The build temporarily bypasses some linting errors for deployment. After deployment, consider:

1. **Fix console statements**: Remove debug console.log statements
2. **Error boundaries**: Add React error boundaries for better error handling
3. **Type safety**: Fix TypeScript any types
4. **Component optimization**: Break down large components

## 🌐 Domain Configuration

### Custom Domain Setup

#### Vercel
1. Go to your project settings in Vercel
2. Add your domain in the "Domains" section
3. Configure DNS records as instructed

#### Cloudflare (Optional)
For better performance, consider using Cloudflare:
1. Add your domain to Cloudflare
2. Update nameservers
3. Configure SSL/TLS settings

## 📊 Monitoring & Analytics

### Recommended Services
- **Performance**: Vercel Analytics / Google PageSpeed
- **Error Tracking**: Sentry / LogRocket
- **Uptime Monitoring**: UptimeRobot / Pingdom

## 🚨 Security Considerations

1. **API Keys**: Never commit API keys to the repository
2. **CORS**: Configure proper CORS policies
3. **Rate Limiting**: Implement rate limiting for APIs
4. **HTTPS**: Always use HTTPS in production

## 📱 Mobile Optimization

The application is mobile-responsive and includes:
- Progressive Web App (PWA) capabilities
- Mobile-optimized layouts
- Touch-friendly interactions

## 🔍 SEO Optimization

- Meta tags configured
- Open Graph tags for social sharing
- Structured data for movie content
- Sitemap generation (can be added)

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version (requires 18+)
2. **API Issues**: Verify external API accessibility
3. **Image Loading**: Ensure image domains are configured in `next.config.ts`
4. **Memory Issues**: Increase deployment platform memory limits if needed

### Debug Mode
```bash
# Enable debug mode
DEBUG=* npm run build
```

### Health Check Endpoint
The application includes basic health checking. Access:
```
GET /api/health
```

## 📞 Support

If you encounter deployment issues:
1. Check the deployment platform's logs
2. Verify all environment variables are set
3. Ensure the build completes successfully locally
4. Check the platform-specific documentation

---

**Note**: This application is optimized for deployment on modern hosting platforms with Node.js support. For static hosting, additional configuration would be required.