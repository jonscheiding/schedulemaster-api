import path from 'path'
import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'

const webpackConfig = {
  devtool: 'source-map',
  entry: './src/style/materialize.js',
  output: {
    filename: 'materialize.js',
    path: path.resolve('./dist'),
    publicPath: '/dist/'
  },
  module: {
    loaders: [
      { test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap'] },
      //
      // This font loader is primarily for MaterializeCSS 
      // See http://stackoverflow.com/questions/31493716/webpack-less-error-it-cant-resolve-ttf-and-woff2-files-from-uikit
      //
      { test: /\.(ttf|woff|woff2|eot)$/, loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]' }
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    //
    // This is a fix required for Materialize since it isn't implemented as a
    // CommonJS module.
    //
    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      'jQuery': 'jquery',
      '$': 'jquery'
    })
  ]
}

const webpackCompiler = webpack(webpackConfig)
export default () => webpackMiddleware(webpackCompiler, { publicPath: webpackConfig.output.publicPath })