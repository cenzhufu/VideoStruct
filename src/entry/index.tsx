import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './assets/styles/index.scss';
import App from 'stsrc/entry/App';
import * as serviceWorker from 'stsrc/entry/serviceWorker';

import { BrowserRouter } from 'react-router-dom';

import * as intl from 'react-intl-universal';
import { LocaleProvider } from 'antd';
import { Locale } from 'antd/lib/locale-provider';
import * as moment from 'moment';
import Language, { SupportLanguage } from 'stutils/locales/language';
import Config from 'stconfig';
// 处理语言包的情况

let language: SupportLanguage = Language.getLocale();

/**
 * 初始化程序使用的环境（主要是一些语言包的配置信息）
 * @returns {(Promise<Locale | null>)} antdLocale的语言包信息，如果为null,则表明加载失败
 */
function initEvironment(): Promise<Locale | null> {
	return Promise.all([
		Language.loadProjectLocalePackage(language),
		Language.loadMomentLocalePackage(language),
		Language.loadAntdLocalePackage(language),
		Config.initSystemConfig(),
		Language.loadVideoLocalePackage(language)
	])
		.then((list: [{ [key: string]: any }, string, Locale, void, void]) => {
			// 初始化intl
			let intlLocale: { [key: string]: any } = list[0];
			intl.init({
				currentLocale: language,
				locales: {
					[language]: intlLocale
				},
				// 公共的locale data
				// 内网环境防治访问不到，可以参考下边链接的说明
				// https://github.com/alibaba/react-intl-universal/releases/tag/1.12.0
				commonLocaleDataUrls: {
					en: `${window.location.origin}/locales/react-intl-universal/en.js`,
					zh: `${window.location.origin}/locales/react-intl-universal/zh.js`
				}
			});

			let momentLocale: string = list[1];
			// 先要加载
			// require(`moment/locale/${momentLocale}`);
			moment.locale(momentLocale);

			let antdLocale = list[2];
			return antdLocale;
		})
		.catch((error) => {
			console.error('加载环境失败', error);
			return null;
		});
}

initEvironment()
	.then((antdLocale: Locale | null) => {
		if (antdLocale) {
			// 渲染app
			ReactDOM.render(
				<LocaleProvider locale={antdLocale}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</LocaleProvider>,
				document.getElementById('root')
			);
		} else {
			// 渲染app
			ReactDOM.render(
				<BrowserRouter>
					<App />
				</BrowserRouter>,
				document.getElementById('root')
			);
		}
	})
	.catch((error: Error) => {
		console.error(error);
	});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
