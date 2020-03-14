// .stylelintrc.js
module.exports = {
	extends: [
		'stylelint-config-standard',
		"stylelint-config-css-modules",
		"stylelint-prettier/recommended"
	],
	plugins: [
		'stylelint-order',
		'stylelint-prettier',
		"stylelint-scss",
		"stylelint-no-unsupported-browser-features",
		"stylelint-selector-bem-pattern"
	],
	rules: {
		"prettier/prettier": true,
		"plugin/no-unsupported-browser-features": [true, {
			"severity": "warning"
		}],
		"plugin/selector-bem-pattern": {

		},
		// 'at-rule-no-unknown': [
		// 	true, {
		// 		'ignoreAtRules': [
		// 			'mixin',
		// 			'extend',
		// 			'content',
		// 			'function'
		// 		]
		// 	}
		// ],
		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
		'indentation': ['tab']
	}
}
