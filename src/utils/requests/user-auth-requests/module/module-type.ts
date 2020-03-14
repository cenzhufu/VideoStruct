export interface IModuleInfo {
	id: string;
	name: string;
	parentId: string; // 父模块id
	operationIds: Array<string>; // 操作的id集合
	menuIds: string; // TODO: 待确认
}

// 模块所属的组的类别
export enum EModuleGroupType {
	DataView = 'DATA_VIEW', // 数据查看
	DataView_Access = 'DATA_ACCESS', // 数据接入
	DataView_View = 'DATA_VIEW_CHILD', // 数据查看
	TargetSearch = 'TARGET_SEARCH', // 目标搜索
	RealTimeAlarm = 'REAL_TIME_ALARM', // 实时告警
	RealTimeAlarm_View = 'ALARM_VIEW', // 告警查看
	RealTimeAlarm_Setting = 'ALARM_SETTINGS', // 告警设置
	AdvancedSetting = 'ADVANCED_SETTINGS', // 高级设置
	AdvancedSetting_Account = 'ACCOUNT_MANAGEMENT', // 账号设置
	AdvancedSetting_Unit = 'UNIT_MANAGEMENT', // 单位设置
	AdvancedSetting_Data = 'DATA_MANAGEMENT', // 数据管理
	AdvancedSetting_Camera = 'CAMERA_MANAGEMENT', // 摄像头管理
	AdvancedSetting_Record = 'RECORD_QUERY' // 记录查询
}

// 模块的结构（包含层级信息）
export interface IBModuleTreeNode {
	id: string;
	name: string;
	createTime: number;
	updateTime: number;
	parentId: string;
	sort: number; // 序号
	ifChecked: boolean;
	data: Array<IBModuleTreeNode>;
	childList: Array<IBModuleTreeNode>;
	resourceCode: EModuleGroupType; // 类型
}
