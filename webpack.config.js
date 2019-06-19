const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const GOOGLE_MAPS_API_KEY = "AIzaSyCSJT7q4DMCHZof90eqi_IRAjmIM6WvpYI";

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]?[hash]"
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js"
    }
  },
  devtool: "eval-source-map",
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html.ejs",
      googleMapsKey: GOOGLE_MAPS_API_KEY
    })
  ]
};

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "source-map";
}
