# BroJS Deployment Guide

## Admin Panel Configuration (admin.brojs.ru)

### 1. Config Section
This is where you place your environment variables. Add the following:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here  
BOOKS_API_KEY=your_books_api_key_here
```

### 2. Navigation Section
You've correctly configured:
- **Prefix**: `read-mind-ai` (this matches your project name)
- **Key**: `main`
- **Value**: `/read-mind-ai` (this is the base path where your app will be accessible)

This means your application will be available at: `https://[brojs-domain]/read-mind-ai`

### 3. Feature Section
This section typically controls platform-specific features like:
- Auto-deployment on push
- Branch selection for deployment
- Build notifications
- SSL/HTTPS settings

Common features you might want to enable:
- Auto-deploy from main/master branch
- Build notifications
- HTTPS redirect

## Important Notes

1. **Base URL Configuration**: The app is configured with `baseURL: '/read-mind-ai/'` in `nuxt.config.ts` to match your BroJS navigation settings.

2. **Environment Variables**: All Supabase-related variables are now properly configured in `runtimeConfig.public` to be accessible on the client side.

3. **Build Output**: BroJS will use the `.output` directory created by Nuxt's build process.

## Deployment Process

1. Push your code to the connected GitHub repository
2. BroJS will automatically:
   - Detect the push
   - Run `yarn install`
   - Run `yarn build` 
   - Deploy the `.output` directory
   - Make it available at `/read-mind-ai`

## Troubleshooting

If deployment fails, check:
1. Environment variables are correctly set in Config
2. Build logs in BroJS admin panel
3. Your app works locally with `yarn build && yarn preview`