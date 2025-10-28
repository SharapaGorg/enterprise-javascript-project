# BroJS Platform Notes (Reverse Engineered)

Since BroJS has no public documentation, here's what we've figured out:

## Platform URL
- Admin panel: `admin.brojs.ru`
- Likely deployment domain: `brojs.ru` or subdomain

## Configuration Method
BroJS appears to use a `.brojs` file in the project root for configuration.

## Possible `.brojs` Configuration Options
```json
{
  "name": "project-name",           // Project identifier
  "type": "nuxt",                   // Framework: nuxt, react, vue, next, etc.
  "buildCommand": "yarn build",     // Command to build the project
  "installCommand": "yarn install", // Command to install dependencies
  "outputDirectory": ".output",     // Where build artifacts go
  "nodeVersion": "20",              // Node.js version
  "basePath": "/project-name",      // URL path where app is served
  "environment": {                  // Build-time env vars
    "NODE_ENV": "production"
  }
}
```

## Admin Panel Sections

### Config
- Place for environment variables
- Format: `KEY=value` (one per line?)

### Navigation
- Routing configuration
- Fields:
  - `prefix`: project identifier
  - `key`: route key (maybe "main" for main route?)
  - `value`: URL path where app is served

### Feature
- Unknown - possibly:
  - Auto-deploy on push
  - Branch selection
  - Build notifications
  - Custom domains?

## Deployment Process (Assumed)
1. Connect GitHub repo in admin panel
2. Configure environment variables in Config
3. Set up Navigation routing
4. Push to connected branch
5. BroJS automatically:
   - Clones repo
   - Runs install command
   - Runs build command
   - Serves from output directory at configured path

## Troubleshooting Ideas
- Check build logs in admin panel
- Ensure `.brojs` file is valid JSON
- Make sure output directory matches what your framework produces
- Verify environment variables are accessible during build

## Questions for BroJS Support
1. Is there official documentation?
2. What are all possible `.brojs` configuration options?
3. What does the "Feature" section control?
4. How to configure custom domains?
5. How to view deployment logs?
6. Is there a CLI tool for local testing?