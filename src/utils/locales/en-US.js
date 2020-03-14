/*全局配置提示消息内容*/
/*全局配置提示消息内容*/
const snackbars = {
	'intl.NETWORK_ERROR': '网络错误,请重新尝试', //键值在组件进行国际化时对应的就是id,具体见组件如何使用
	'intl.SUCCESS': '操作成功',
	'intl.PHONE_EXITS': '手机号码已存在',
	'intl.CODE_ERROR': '验证码错误',
	'intl.LOGIN_SUCCESS': '登录成功',
	'intl.NAME': '你好, 我的名字是{name}'
};

const common = {
	SURE_BTN: '确认',
	CANCLE_BTN: '取消',
	FILE_NAME: '文件名',
	ERROR_PARAMETERS: '无效的参数'
};

const en_US = {
	...snackbars,
	...common,

	/**
		目标搜索模块
	*/
	//检索范围弹窗
	REAL_TIME_VIDEO_SEARCH: '区域/派出所/街道/摄像头',
	SELECT_ALL: '全选',
	SELECT_INVERT: '反选',
	HAD_SELECTED: '已选择',
	REAL_TIME: '实时',
	VIDEO: '视频',
	IMAGE: '图片',

	//图片上传
	SPECIFY_SEARCH_RANGE: '指定搜索范围',
	SEARCH_BTN: '搜索',
	CHANGE_RANGE: '切换范围',
	SEARCH_SELECT_IMAGE_TIP: '点击/拖拽图片检索(最多5张)'
};

export default en_US;
