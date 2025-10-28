const pkg = require('./package.json')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'read-mind-ai.main': '/read-mind-ai',
    'read-mind-ai.books': '/read-mind-ai/books',
    'read-mind-ai.profile': '/read-mind-ai/profile',
    'link.read-mind-ai.auth': '/auth'
  },
  features: {
    'read-mind-ai': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    'read-mind-ai.api': '/api',
    'read-mind-ai.books-api': '/api/books'
  }
}