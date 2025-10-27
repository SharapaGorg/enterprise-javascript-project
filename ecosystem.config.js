module.exports = {
  apps: [{
    name: 'readmind',
    script: './.output/server/index.mjs',
    env: {
      NODE_ENV: 'production',
      PORT: 8742,
      HOST: '0.0.0.0'
    }
  }]
}