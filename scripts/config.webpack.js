// Purpose: Provide Webpack configuration

// Import modules
const env = require('./env')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyPlugin = require('uglifyjs-webpack-plugin')
const HTMLPlugin = require('html-webpack-plugin')

// Export Wepack configuration
module.exports = (params) => {
  // Define mode
  const mode = params && params.NODE_ENV === 'production' ? 'production' : 'development'

  // Create configuration object
  const webpackConfig = {
    module: {
      rules: [],
    },
    plugins: [],
  }

  // Add entry point
  webpackConfig.entry = {
    app: env.path.client('entry.js'),
    vendor: env.path.client('vendor.js'),
  }

  // Add output point
  webpackConfig.output = {
    path: env.path.proj('build'),
    filename: 'js/[name].bundle.js',
  }

  // Add Vue loader
  webpackConfig.module.rules.push({
    test: /\.vue$/,
    use: 'vue-loader',
  })

  // Add CSS loader, minimize and extract to CSS bundle file
  webpackConfig.module.rules.push({
    test: /\.css$/,
    use: mode === 'production' ? ExtractTextPlugin.extract({ loader: 'css-loader', options: { minimize: true } }) : ['style-loader', 'css-loader'],
  })
  if (mode === 'production') {
    webpackConfig.plugins.push(new ExtractTextPlugin('css/[name].bundle.css'))
  }

  // Compress JS and CSS
  if (mode === 'production') {
    webpackConfig.plugins.push(new UglifyPlugin())
  }

  // Add image support
  webpackConfig.module.rules.push({
    test: /\.(jpg|png|gif)$/,
    use: 'file-loader',
  })

  // Add icon fonts support
  webpackConfig.module.rules.push({
    test: /\.(eot|woff|woff2|ttf)$/,
    use: 'file-loader',
  })

  // Add HTML template
  webpackConfig.plugins.push(new HTMLPlugin({
    template: env.path.client('index.html'),
  }))

  // Configure development server
  if (mode === 'development') {
    webpackConfig.devServer = {
      contentBase: env.path.app(),
      compress: true,
      host: process.env.IP || 'localhost',
      port: process.env.PORT || env.cfg.app.devServerPort,
    }
  }

  // Make environment variables available in client code
  process.env.NODE_ENV = mode
  webpackConfig.plugins.push(new webpack.EnvironmentPlugin(['NODE_ENV']))

  // Return configuration
  return webpackConfig
}