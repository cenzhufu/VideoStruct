import { Locale } from 'antd/lib/locale-provider';
const load = require('load-script');
type SupportLanguage = 'zh-CN' | 'en-US';

let language: SupportLanguage = 'zh-CN'; //  从配置文件获取

/**
 * 获得当前选择的语言
 * @returns {SupportLanguage} 返回当前语言，如‘zh-CN’
 */
function getLocale(): SupportLanguage {
	return language;
}

/**
 *	设置语言
 * @param {SupportLanguage} lang  传入要设置的语言，如‘zh-CN’
 * @returns {void} void
 */
function setLocale(lang: SupportLanguage): void {
	let validLocale: SupportLanguage = lang;

	if (!lang) {
		console.warn('set locale has no paremeters, so it will has no effect');
	}

	// 过滤参数
	validLocale = filterLocale(lang);

	// eslint-disable-next-line
	if (getLocale() != validLocale) {
		language = validLocale;
	}
}

/**
 * 过滤无效的locale，使得返回值是我们支持的语言
 * @param {SupportLanguage} locale 需要验证的locale
 * @param {SupportLanguage} defaultValue 验证失败/默认返回的locale
 * @returns {SupportLanguage} 如果验证成功，则返回当前传入的locale， 否则返回defaultValue对应的locale
 */
function filterLocale(
	locale: SupportLanguage,
	defaultValue: SupportLanguage = 'zh-CN'
): SupportLanguage {
	switch (locale.toLocaleLowerCase()) {
		case 'en-us':
			return 'en-US';

		default:
			return defaultValue;
	}
}

/**
 * 下载项目中使用的语言包
 * @param {SupportLanguage} locale 需要下载的语言
 * @returns {Object} 语言包的配置对象
 */
async function loadProjectLocalePackage(
	locale: SupportLanguage
): Promise<{ [key: string]: any }> {
	if (!locale) {
		return Promise.reject(
			new Error('unvalid paratmer in loadProjectLocalePackage')
		);
	}

	let result = await import(/* webpackChunkName: 'locale-' */ `stutils/locales/${locale}.js`);
	// TODO: 加载public下的国际化文件
	return result['default'] || {};
}

/**
 * 下载moment需要的语言包
 * @param {SupportLanguage} locale 需要下载的语言
 * @returns {Promise<Object>} 语言包的配置对象
 */
async function loadMomentLocalePackage(
	locale: SupportLanguage
): Promise<string> {
	if (!locale) {
		return Promise.reject(new Error('unvalid paratmer in momentLocalePackage'));
	}

	// eslint-disable-next-line
	// if (locale != 'en-US') {
	// 	// moment默认的语言，不需要下载
	// 	// @NOTE: 会导致moment的语言包全部被打进来(大约50kb)
	// 	await import(/* webpackChunkName: 'moment-locale' */ `moment/locale/${locale.toLocaleLowerCase()}`);
	// }
	return locale.toLocaleLowerCase();
}

/**
 * 下载antd需要的语言包
 * @param {SupportLanguage} locale 需要下载的语言
 * @return  {Promise<Object>} 语言包的配置对象
 */
async function loadAntdLocalePackage(locale: SupportLanguage): Promise<Locale> {
	if (!locale) {
		return Promise.reject(
			new Error('unvalid paratmer in loadAntdLocalePackage')
		);
	}

	let antdLocale = locale.replace(/-/g, '_');
	let result = await import(/* webpackChunkName: 'antd-locale' */ `antd/lib/locale-provider/${antdLocale}`);
	return result;
}

function getAntLocale(locale: SupportLanguage): string {
	let antdLocale = locale.replace(/-/g, '_');
	return antdLocale;
}

/**
 * 下载播放器对应的语言包
 * @param {SupportLanguage} locale 需要下载的语言
 * @returns {Promise<void>} void
 */
function loadVideoLocalePackage(locale: SupportLanguage): Promise<void> {
	// 加载播放器对应的语言包
	// 加载语言包
	return new Promise(function(resolve, reject) {
		load(`${window.location.origin}/locales/videojs/${locale}.js`, function(
			error: Error,
			script
		) {
			// NOTE: videojs 即使没有加载成功，当我们使用对应的语言去设置videojs时，会显示默认的英文配置
			// if (error) {
			// 	reject(error);
			// } else {
			// 	resolve();
			// }
			resolve();
		});
	});
}

const Language = {
	setLocale,
	getLocale,

	getAntLocale,

	loadProjectLocalePackage,
	loadMomentLocalePackage,
	loadAntdLocalePackage,
	loadVideoLocalePackage
};

export default Language;
export { SupportLanguage };
