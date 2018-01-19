const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

require('dotenv').config();


module.exports = {
	entry: {
		app: path.join(__dirname, 'client/index.js'),
		'pdf-worker': path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.js'),
		'api-worker': path.join(__dirname, 'worker/index.js'),
	},
	output: {
		filename: '[name].js',
		chunkFilename: '[name].js',
		path: path.join(__dirname, 'build'),
	},
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.js', '.vue'],
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			GCLOUD_BUCKET: JSON.stringify(process.env.GCLOUD_BUCKET),
			ANALYTICS_ID: JSON.stringify(process.env.ANALYTICS_ID),
			API_SERVER_ORIGIN: JSON.stringify(process.env.API_SERVER_ORIGIN || null),
		}),
		new CopyWebpackPlugin([{
			from: path.join(__dirname, 'client/static'),
			to: path.join(__dirname, 'build'),
			ignore: ['.*'],
		}]),
		new CopyWebpackPlugin([{
			from: path.join(__dirname, 'node_modules/pdfjs-dist/cmaps/'),
			to: path.join(__dirname, 'build/cmaps/'),
			ignore: ['.*'],
		}]),
	],
	devtool: '#eval-source-map',
};

if (process.env.NODE_ENV === 'production') {
	module.exports.devtool = '#source-map',

	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			},
		}),
		new UglifyJsPlugin({
			sourceMap: true,
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
	]);
};
