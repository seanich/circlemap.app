const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { VueLoaderPlugin } = require("vue-loader");

const GOOGLE_MAPS_API_KEY = "AIzaSyCSJT7q4DMCHZof90eqi_IRAjmIM6WvpYI";

const prod = process.env.NODE_ENV === "production";

module.exports = {
  entry: "./src/index.ts",
  mode: prod ? "production" : "development",
  devtool: prod ? "source-map" : "eval-source-map",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: `[name]${prod ? ".[chunkhash]" : ""}.js`,
    chunkFilename: `[name]${prod ? ".[chunkhash]" : ""}.js`,
    sourceMapFilename: `[name]${prod ? ".[chunkhash]" : ""}.js.map`,
    hashFunction: "sha256",
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: !prod } },
        ],
      },
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]?[hash]",
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".vue", ".json"],
    alias: {
      vue$: prod ? "vue/dist/vue.min.js" : "vue/dist/vue.esm.js",
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: prod ? "[name].style.[chunkhash].css" : "[name].style.css",
      chunkFilename: prod ? "[id].style.[chunkhash].css" : "[id].style.css",
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html.ejs",
      inject: true,
    }),
    new webpack.DefinePlugin({
      "process.env.GOOGLEMAPS_KEY": JSON.stringify(GOOGLE_MAPS_API_KEY),
    }),
  ],
  devServer: {
    hot: true,
  },
};
