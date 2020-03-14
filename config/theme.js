// 自定义antd主题
const sassVars = require('../src/assets/styles/basic.style.js');

const theme = {
	// Background color for `<body>`
	"body-background": sassVars.colors.backgroundColor,
	// Base background color for most components
	// "component-background": sassVars.colors.componentBackgroundColor,
	"text-color": sassVars.colors.textSecondColor, // TODO: message的颜色
	"text-color-secondary": sassVars.colors.textSecondColor,
	"heading-color": sassVars.colors.textColor,

	'border-color-inverse': sassVars.colors.darkGrayColor, // calender border

	// layout
	"layout-header-background": sassVars.colors.darkBackgroundColor,
	"layout-body-background": sassVars.colors.backgroundColor,
	"layout-sider-background": sassVars.colors.componentBackgroundColor,
	// "layout-sider-background": "",

	"background-color-light": sassVars.colors.darkGrayColor,

	// border color
	'border-color-split': sassVars.colors.borderColor,

	// Disabled states
	"disabled-color": sassVars.colors.textSecondColor,

	// table
	"table-selected-row-bg": sassVars.colors.backgroundHoverColor,
	"table-row-hover-bg": sassVars.colors.backgroundHoverColor,

	// card
	"card-radius": sassVars["card-radius"],

	// The background colors for active and hover states for things like
	// list items or table cells.
	"item-active-bg": sassVars.colors.backgroundHoverColor,
	"item-hover-bg": sassVars.colors.backgroundHoverColor,

	// buttons
	"btn-default-color": sassVars.colors.textSecondColor,
	"btn-default-bg": 'unset',
	"btn-default-border": sassVars.colors.textSecondColor,
	"btn-disable-bg": sassVars.colors.componentForgroundColor,

	// select
	"select-border-color": sassVars.colors.componentForgroundColor,

	// check box
	"checkbox-color": sassVars.colors.componentForgroundColor,

	// popover
	"popover-bg": sassVars.colors.secondBackgroundColor,

	//slider
	'slider-rail-background-color': sassVars.colors.darkGrayColor,
	'slider-track-background-color': sassVars.colors.componentForgroundColor,
	'slider-rail-background-color-hover': 'gray',

	// tabs
	'tabs-bar-margin': 0,

	// 'zindex-modal-mask': 2000,
	// 'zindex-modal': 2000,
	'zindex-popover': 1000,

	// tag
	'tag-default-bg': sassVars.colors.tagBackgroundColor,

	'switch-color': sassVars.colors.primaryColor,

	'badge-text-color': sassVars.colors.secondBackgroundColor
}

module.exports = theme;
