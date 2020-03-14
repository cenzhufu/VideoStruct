// 项目的基础样式，我们将用这个文件中的配置来生成
// 自定义antd的样式规则
// 项目基础的scss文件
const Color = require('color');

module.exports = {
	// NOTE: 保证都是6位
	colors: {
		flagColor: 'red', // 标志颜色（一般用于logo）
		backgroundColor: Color('#E5E9EC').string(), // 背景色
		secondBackgroundColor: '#ffffff ', // 辅助背景色

		componentBackgroundColor: '#424F66', // 组件背景色
		componentForgroundColor: Color('#0A7bff').string(), // 组件的前景色（使用此颜色来突出组件)
		darkBackgroundColor: '#1B222E',

		textColor: '#576574', // 文字颜色
		textSecondColor: '#8395A7', // 文字辅助颜色
		textDarkColor: '$text-dark-color', //

		backgroundHoverColor: '#c8d6e4', // hover时的背景色
		darkGrayColor: '#3e455f', // 多用于边框,可能会出现在一些阴影,背景颜色中

		tagBackgroundColor: '#3b4560',

		borderColor: '#C8D6E4',

		hoverColor: '#EBF3F9',

		// TODO: 二期变量，临时记着（暂时不要用）

		stateColor1: '#FC6F71',
		stateColor2: '#FFD42C',
		stateColor3: '#29E0BA',

		normalColor: '#F2F4F5', // 车辆类型已用 暂！
		primaryColor: '#1890ff'
	},
	'card-radius': '4px'
};
