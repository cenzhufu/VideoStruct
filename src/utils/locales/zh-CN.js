let zh_CN = {};

// 加载src下边的所有中文配置
let zhCNFiles = require.context('../../../src', true, /zh-CN\.js/);
zhCNFiles.keys().forEach((key) => {
	// 排除自身的文件
	if (key === './utils/locales/zh-CN.js') {
		return;
	}

	// 扩展
	zh_CN = {
		...zh_CN,
		...zhCNFiles(key).default
	};
});

// 加载public下边的所有中文配置
let zhCNPublicFiles = require.context('../../../public', true, /zh-CN\.json/);
zhCNPublicFiles.keys().forEach((key) => {
	// 扩展
	zh_CN = {
		...zh_CN,
		...zhCNPublicFiles(key)
	};
});

/*全局配置提示消息内容*/
const snackbars = {
	'intl.NETWORK_ERROR': '网络错误,请重新尝试', //键值在组件进行国际化时对应的就是id,具体见组件如何使用
	'intl.SUCCESS': '操作成功',
	'intl.PHONE_EXITS': '手机号码已存在',
	'intl.CODE_ERROR': '验证码错误',
	'intl.LOGIN_SUCCESS': '登录成功',
	'intl.NAME': '你好, 我的名字是{name}',
	'intl.AUTHORITY_HINT_INFO_TITLE': '你没有操作/访问权限',
	'intl.AUTHORITY_HINT_INFO_MESSAGE': '请联系超级管理员开通权限',
	'intl.DATA_DELETE_CONFIRM_TITLE': '你确定要删除此条数据？',
	'intl.DATA_DELETE_CONFIRM_MESSAGE': '同时删除所有解析的图片',
	'intl.AUTHORITY_HINT_BUTTON_TEXT': '知道了'
};

const common = {
	SURE_BTN: '确定',
	CANCLE_BTN: '取消',
	FILE_NAME: '文件名',
	ERROR_PARAMETERS: '无效的参数',
	COMMON_UNKNOWN_ERROR: '未知错误',
	COMMON_LOADING: '加载中...',
	SEARCHING: '搜索中...',
	EXIT: '退出',

	COMMON_RIGHT_STRING: '请输入正确字符',

	COMMON_COUNT: '张',
	COMMON_NONE: '无',
	ATTRIBUTE_COMMON_UNKNOWN: '未知',
	COMMON_RETURE: '返回',

	ANALYSIS_INFO_TARGET_ALL: '全部',
	ANALYSIS_INFO_TARGET_BODY: '人体',
	ANALYSIS_INFO_TARGET_FACE: '人脸',
	ANALYSIS_INFO_TARGET_CAR: '车辆',

	COMMON_NO_LOGIN_OR_NO_PERMISSION: '当前用户未登录或没有接入权限',

	// source type
	COMMON_SOURCE_TYPE_REALTIME_VIDEO: '实时视频',
	COMMON_SOURCE_TYPE_OFFLINE_VIDEO: '离线视频',
	COMMON_SOURCE_TYPE_BATCH_IMAGES: '批量图片',

	COMMON_NO_DATA: '暂无数据'
};

const zh_CN_old = {
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

	//搜索结果
	FACE_RESULTS: '人脸结果',
	BODY_RESULTS: '人体结果',
	CAR_RESULTS: '车辆结果',
	FACE_PICTURES: '人脸照片',
	BODY_PICTURES: '人体照片',
	CAR_PICTURES: '车辆照片',
	CHECK_RELATE_BODY: '同时查看关联人体视图',
	CHECK_RELATE_FACE: '同时查看关联人脸视图',
	SEARCH_ACCURACY: '属性精确度',

	DEFAULT_SORT: '默认排序',
	THRESHOLD_SORT: '相似度排序',
	UPLOAD_LIMIT: '上传照片(最多5张)',
	NO_DATA: '暂无数据',
	RECENT_FACE_RESULTS: '最近解析人脸',
	RECENT_BODY_RESULTS: '最近解析人体',
	RECENT_CAR_RESULTS: '最近解析车辆',
	IMAGE_UPLOADING: '图片上传分析中',

	//用户中心
	USER_UPLOAD_RECORD: '上传记录',
	USER_CHANGE_PASSWORD: '修改密码',
	USER_BATCH_DELETE: '批量删除',
	USER_ACCESS_TIME: '接入时间',
	USER_FILE_TYPE_OR_NAME: '文件类型/名',
	USER_FILE_STATUS: '状态',
	USER_FILE_SIZE: '大小',
	USER_FILE_COUNT: '解析总数',
	USER_FILE_TIME: '时间',
	USER_UPLOADER_ACCOUNT: '上传账号',
	USER_UPLOADER_NAME: '上传姓名',
	USER_OPERATE: '操作',
	USER_DELETE: '删除',
	USER_VIEW: '查看',
	SURE_TO_DELETE: '确定删除所选记录？',
	IMG_SIZE_MORE_TANN_TIP: '上传的图片不能大于10M！',

	UPLOAD_IMAGE_ONLY_ACCEPTED: '只支持.jpg, .jpeg,.png格式的文件！',

	// USER_CHANGE_PASSWORD: '修改密码',
	USER_CURRENT_PASSWORD: '当前密码',
	USER_NEW_PASSWORD: '新密码',
	SURE_CONFIRM_PASSWORD: '确认密码',
	SURE_PLEASE_INPUT_PASSWORD: '请填写密码',
	SURE_PLEASE_INPUT_NEW_PASSWORD: '请填写新密码（6~12位）',
	SURE_PASSWORD_IS_DIFFERENT: '两次输入密码不一致！',
	SURE_CHANGE_AVATAR: '修改头像',
	USER_DELETE_SUCCESS: '删除成功！',
	USER_DELETE_FAIL: '删除成功！',
	ACCOUNT_ADD_FORM_COMFIRM: '密码确认',
	ACCOUNT_ADD_PASSWORD_AGAIN_WRONG: '两次输入密码不一致!',
	ACCOUNT_ADD_PASSWORD_INPUT_AGAIN: '请再次输入密码',

	//高级设置
	ADVANCE_SETTING: '高级设置',
	ACCOUNTS_MANAGEMENT: '账号管理',
	UNITIES_MANAGEMENT: '单位管理',
	AUTHORITY_MANAGEMENT: '权限管理',
	/* 权限管理 */
	AUTHORITY_MANAGEMENT_ADDBTN: '新增权限',
	AUTHORITY_MANAGEMENT_EDITMODALTITLE: '修改权限',
	AUTHORITY_MANAGEMENT_MODALTIP_NAME: '权限名称',
	AUTHORITY_MANAGEMENT_MODALTIP1_INPUT: '请输入权限名称',
	AUTHORITY_MANAGEMENT_MODALADD_TITLE: '请输入不超过10位字符',
	AUTHORITY_MANAGEMENT_MODALTIP1_CHECKINPUT1: '权限名称可用',
	AUTHORITY_MANAGEMENT_MODALTIP1_CHECKINPUT2: '权限名称重复',
	AUTHORITY_MANAGEMENT_MODALTIP2: '请先输入权限名称',
	AUTHORITY_MANAGEMENT_MODALTIP3: '请选择权限模块',
	AUTHORITY_MANAGEMENT_MODALTIP4: '权限名称重复，请重新输入',
	AUTHORITY_MANAGEMENT_MODALTIP5: '单位部门',
	/* 权限管理 */
	CAMERAS_MANAGEMENT: '设备管理',
	CAMERAS_MANAGEMENT_AREA: '区域管理',
	AUTHORITY_DELETE_USER_SUCCESS: '删除权限成功',
	AUTHORITY_ADD_USER_SUCCESS: '新增权限成功',
	AUTHORITY_EDIT_USER_SUCCESS: '编辑权限成功',
	AUTHORITY_MANAGEMENT_MdODALADD_TITLE_NULL_MESSAGE: '新增权限名称不能为空',
	/* 区域管理 */
	CAMERAS_MANAGEMENT_AREA_ADDBTN: '添加区域',
	CAMERAS_MANAGEMENT_AREA_SEARCH: '区域名称',
	AREA_ADD_SUCCESS: '添加区域成功！',
	AREA_EDIT_SUCCESS: '修改区域成功！',
	AREA_DELETE_SUCCESS: '删除区域成功！',
	/* 区域管理 */
	CAMERAS_MANAGEMENT_CAMERAS: '设备管理',
	/* 摄像头管理 */
	CAMERAS_MANAGEMENT_CAMERAS_ADDBTN: '添加设备',
	CAMERAS_MANAGEMENT_CAMERAS_SEARCH: '设备名称',
	CAMERAS_MANAGEMENT_FORM_ADDTITLE: '增加设备',
	CAMERAS_MANAGEMENT_FORM_EDITTITLE: '修改设备',
	CAMERAS_MANAGEMENT_FORM_CASCADER: '请选择设备所属区域',
	CAMERAS_MANAGEMENT_FORM_PORT: '请输入端口号',
	CAMERAS_MANAGEMENT_FORM_MESSAGE: '请输入正确的端口号',
	CAMERAS_MANAGEMENT_FORM_NAME: '请输入不超过20位中英文字符',
	CAMERAS_MANAGEMENT_FORM_IP: '请输入IP地址(如:192.168.11.11)',
	CAMERAS_MANAGEMENT_FORM_IP_MESSAGE: '请输入正确的IP地址',
	CAMERAS_MANAGEMENT_FORM_CHANNEL_NUMBER: '通道号',
	CAMERAS_MANAGEMENT_FORM_CHANNEL: '请输入通道号',
	CAMERAS_MANAGEMENT_FORM_MESSAGE_CHANNEL: '请输入正确的通道号',
	CAMERAS_MANAGEMENT_FORM_LOGINUSER: '请输入账号',
	CAMERAS_MANAGEMENT_FORM_PASSWORD: '请输入密码',
	CAMERAS_MANAGEMENT_FORM_LONGITUDE: '请输入经度',
	CAMERAS_MANAGEMENT_FORM_LATITUDE: '请输入纬度',
	CAMERAS_MANAGEMENT_FORM_SUBMIT: '确定',
	CAMERAS_MANAGEMENT_TABLE_AREA: '区域',
	CAMERAS_MANAGEMENT_TABLE_CAMERA_NAME: '设备名称',
	CAMERAS_MANAGEMENT_TABLE_IP_ADDRESS: 'IP地址',
	CAMERAS_MANAGEMENT_TABLE_PORT: '端口号',
	CAMERAS_MANAGEMENT_TABLE_OPERATION: '操作',
	CAMERAS_MANAGEMENT_ADD_SUCCESS: '添加设备成功',
	CAMERAS_MANAGEMENT_EDIT_SUCCESS: '修改设备成功',
	CAMERAS_MANAGEMENT_DELETE_SUCCESS: '删除设备成功',

	/* 摄像头管理 */
	/* 摄像头管理 */
	/* 摄像头管理 */
	DATA_MANAGEMENT: '数据管理',
	RECORD_SEARCH: '记录查询',

	//账号管理
	NAME: '姓名',
	ACCOUNT: '账号',
	PASSWORDS: '密码',
	UNITS: '单位',
	OPERATION: '操作',
	UNITS_DEPARTMENT: '单位部门',
	ACCOUNT_PERMISSION: '账号权限',
	FILE_NAME: '文件名',
	ACCOUNT_ADD: '添加账号',
	EDIT_ADD: '编辑账号',
	UNITIES_SELECT: '单位选择:',
	ACCOUNT_DATA_EDIT: '编辑',
	ACCOUNT_DATA_DELETE: '删除',
	ACCOUNT_DATA_CHECK: '查看',

	//新增账号
	ACCOUNT_ADD_NAME: '请输入2至10位字符',
	ACCOUNT_ADD_ACCOUNT: '请输入2位以上账号',
	ACCOUNT_ADD_PASSWORD: '请输入6位以上密码',
	ACCOUNT_ADD_PASSWORD_CONFIRM: '请输入6位以上确认密码',
	ACCOUNT_ADD_ORGANIZATION: '请选择用户单位',
	ACCOUNT_ADD_ROLES: '请选择用户角色',
	ACCOUNT_ADD_UPLOAD_IMAGE: '上传图像',
	ACCOUNT_ADD_AUTHORITY: '账号权限',
	ACCOUNT_ADD_USER_SUCCESS: '新增账号成功',
	ACCOUNT_DELETE_USER_CONFIRM: '确认删除该数据？',
	ACCOUNT_DELETE_USER_SUCCESS: '删除账号成功',
	ACCOUNT_EDIT_USER_SUCCESS: '修改账号成功',
	ACCOUNT_ADD_USER_FAIL: '新增账号失败',

	//单位管理
	UNITS_MANAGEMENT: '单位管理',
	UNITIES_NAME: '单位名称',
	UNIT_ADD: '添加单位',
	UNIT_DELETE_MODAL: '确认删除',
	UNIT_DELETE_MESSAGE: '确认删除该组织信息？',
	UNITS_SETTING_NEW: '请填写新单位的名字',
	UNITS_ADD_SUCCESS: '添加单位成功！',
	UNITS_EDIT_SUCCESS: '修改单位成功！',
	UNITS_DELETE_SUCCESS: '删除单位成功！',
	UNITS_OPTION_SELECT_UNIT: '请选择单位',
	UNITS_OPTION_SELECT_AREA: '请选择区域',
	UNITS_MANEMENT_EDIT_TITLE_NULL: '请输入非空字符！',
	//摄像头管理
	AREAS_MANAGEMENT: '区域管理',
	AREAS_ADD: '添加区域',
	AREAS_NAME: '区域名称',
	//数据管理
	DATA_SOURCE_TYPE: '文件类型/名',
	DATA_STATUS_TYPE: '状态',
	DATA_FILE_SIZE: '大小',
	DATA_ANALYSIS_TARGETS: '解析类型',
	DATA_ANALYSIS_COUNTS: '解析总数 （张）',
	DATA_UPLOAD_TIME: '时间',
	DATA_UPLOAD_ACCOUNT: '上传账号',
	DATA_UPLOAD_ORGANIZATION: '上传单位',
	DATA_BATCH_DELETE: '批量删除',
	DATA_ACCESS_TIME: '接入时间:',
	DATA_WAITING_ANALYSIS: '等待接入',
	DATA_ANALYSIS_FINISHED: '解析完成',
	DATA_WAITING_REALTIME: '实时接入',
	DATA_ANALYSISING_NOW: '正在解析',
	DATA_ANALYSIS_UNKNOWN: '未知状态',
	DATA_DELETE_CONFIRM: '确认删除该数据?',
	DATA_DELETE_SUCCESS: '数据源删除成功',

	// upload组件
	MULTI_STRUCTAL_QUICK_TO_SEARCH: '快速检索'
};

zh_CN = {
	...zh_CN,
	...zh_CN_old
};

export default zh_CN;
