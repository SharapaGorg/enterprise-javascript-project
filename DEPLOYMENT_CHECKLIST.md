# BroJS Deployment Checklist

## ✅ Pre-deployment Steps

1. **Environment Variables in BroJS Config** (admin.brojs.ru):
   - [x] `SUPABASE_URL` - Your Supabase project URL
   - [x] `SUPABASE_KEY` - Your Supabase anonymous key
   - [x] `BOOKS_API_KEY` - Your Google Books API key

2. **Navigation Settings**:
   - [x] Prefix: `read-mind-ai`
   - [x] Key: `main`
   - [x] Value: `/read-mind-ai`

3. **Code Configuration**:
   - [x] `nuxt.config.ts` has `baseURL: '/read-mind-ai/'`
   - [x] Supabase module configured with env vars
   - [x] `.brojs` file with correct settings

## 🚀 Deployment

1. Commit and push your changes to the branch connected in BroJS
2. BroJS will automatically:
   - Install dependencies (`yarn install`)
   - Build the project (`yarn build`)
   - Deploy to `https://[brojs-domain]/read-mind-ai`

## 🔍 Post-deployment Verification

1. Check build logs in BroJS admin panel
2. Visit `https://[brojs-domain]/read-mind-ai`
3. Test authentication (login/register)
4. Verify Supabase connection
5. Test book search functionality

## 🐛 Troubleshooting

If something doesn't work:

1. **Supabase Connection Issues**:
   - Verify env vars are correctly set in BroJS Config
   - Check Supabase project is active
   - Ensure anonymous key has proper permissions

2. **Routing Issues**:
   - Make sure all internal links use relative paths
   - Check that `baseURL` in `nuxt.config.ts` matches BroJS navigation value

3. **Build Failures**:
   - Check build logs in BroJS admin
   - Test locally with `yarn build`
   - Ensure all dependencies are in `package.json`