// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const path = require('path');
const autoprefixer = require('autoprefixer');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
// const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
console.log('tsconfig', path.resolve(__dirname, './tsconfig.json'));
const theme = require('../config/theme.js');

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/
const lessModuleRegex = /\.module\.less$/

// js -> sass
const toSass = require('../config/js2sass');
const sassVars = require('../src/assets/styles/basic.style.js');

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
	const loaders = [
		require.resolve('style-loader'),
		{
			loader: require.resolve('css-loader'),
			options: cssOptions,
		},
		{
			// Options for PostCSS as we reference these options twice
			// Adds vendor prefixing based on your specified browser support in
			// package.json
			loader: require.resolve('postcss-loader'),
			options: {
				// Necessary for external CSS imports to work
				// https://github.com/facebook/create-react-app/issues/2677
				ident: 'postcss',
				plugins: () => [
					require('postcss-flexbugs-fixes'),
					autoprefixer({
						flexbox: 'no-2009',
					}),
				],
			},
		},
	];
	if (preProcessor) {
		// 单独对于sass-loader
		if (preProcessor === 'sass-loader') {
			loaders.push({
				loader: require.resolve(preProcessor),
				options: {
					// 厉害，要给跪系列，这脑洞，估计也就我了吧
					functions: {
						// 提供给scss的自定义函数
						"get($keys)": function (keys) {
							return toSass(keys, sassVars);
						}
					}
				}
			});
		} else {
			loaders.push(require.resolve(preProcessor));
		}
	}
	return loaders;
};

module.exports = (baseConfig, env, config) => {
	config.plugins.push(new TsconfigPathsPlugin({
		configFile: path.resolve(__dirname, './tsconfig.json')
	}));

	config.module.rules.push({
		test: /\.(ts|tsx)$/,
		loader: require.resolve('babel-loader'),
		options: {
			presets: [
				['react-app', {
					flow: false,
					typescript: true
				}]
			]
		}
	});

	config.module.rules.push(
		// "postcss" loader applies autoprefixer to our CSS.
		// "css" loader resolves paths in CSS and adds assets as dependencies.
		// "style" loader turns CSS into JS modules that inject <style> tags.
		// In production, we use a plugin to extract that CSS to a file, but
		// in development "style" loader enables hot editing of CSS.
		// By default we support CSS Modules with the extension .module.css
		{
			test: cssRegex,
			exclude: cssModuleRegex,
			use: getStyleLoaders({
				importLoaders: 1,
			}),
		},
		// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
		// using the extension .module.css
		{
			test: cssModuleRegex,
			use: getStyleLoaders({
				importLoaders: 1,
				modules: true,
				getLocalIdent: getCSSModuleLocalIdent,
			}),
		},
		// Opt-in support for SASS (using .scss or .sass extensions).
		// Chains the sass-loader with the css-loader and the style-loader
		// to immediately apply all styles to the DOM.
		// By default we support SASS Modules with the
		// extensions .module.scss or .module.sass
		{
			test: sassRegex,
			exclude: sassModuleRegex,
			use: getStyleLoaders({
				importLoaders: 2
			}, 'sass-loader'),
		},
		// Adds support for CSS Modules, but using SASS
		// using the extension .module.scss or .module.sass
		{
			test: sassModuleRegex,
			use: getStyleLoaders({
					importLoaders: 2,
					modules: true,
					getLocalIdent: getCSSModuleLocalIdent,
				},
				'sass-loader'
			),
		},
		// Opt-in support for LESS (using .less extensions).
		// Chains the less-loader with the css-loader and the style-loader
		// to immediately apply all styles to the DOM.
		// By default we support LESS Modules with the
		// extensions .module.less or .module.less
		{
			test: lessRegex,
			exclude: lessModuleRegex,
			use: [...getStyleLoaders({
				importLoaders: 2
			}), {
				loader: 'less-loader',
				options: {
					modifyVars: theme,
					javascriptEnabled: true
				}
			}]
		},
		// Adds support for CSS Modules, but using SASS
		// using the extension .module.less or .module.less
		{
			test: lessModuleRegex,
			use: [...getStyleLoaders({
					importLoaders: 2,
					modules: true,
					getLocalIdent: getCSSModuleLocalIdent,
				}),
				{
					loader: 'less-loader',
					options: {
						modifyVars: theme,
						javascriptEnabled: true
					}
				}
			]
		})

	// config.plugins.push(new TSDocgenPlugin()); // optional
	config.resolve.extensions.push('.ts', '.tsx');

	config.resolve.alias = {
		...(config.resolve.alias || {}),
		// Support React Native Web
		// https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
		'react-native': 'react-native-web',

		// 基础组件(IFXXXXX)
		"ifvendors": path.resolve(__dirname, '..', 'src', 'vendors'), // 基础组件库的根路劲
		'ifutils': path.resolve(__dirname, '..', 'src', 'vendors', 'utils'), // 基础组件库的utils文件夹

		//  项目路径别名
		'stsrc': path.resolve(__dirname, '../src'), // 项目src的根目录
		'stcontainers': path.resolve(__dirname, '../src/containers'), // 项目containers目录
		'stcomponents': path.resolve(__dirname, '../src/components'), // 项目components目录
		'stpages': path.resolve(__dirname, '../src/pages'), // 项目pages目录
		'stutils': path.resolve(__dirname, '../src/utils'), // 项目utils目录
		'stassets': path.resolve(__dirname, '../src/assets'), // 项目assets目录
		'stconfig': path.resolve(__dirname, '..', 'src', 'utils', 'config'), // 项目配置目录
		'sttypedefine': path.resolve(__dirname, '..', 'src', 'type-define'), // 项目中公用的类型定义
		'stcontexts': path.resolve(__dirname, '..', 'src', 'contexts') // 项目中context
	}

	return config;
};
