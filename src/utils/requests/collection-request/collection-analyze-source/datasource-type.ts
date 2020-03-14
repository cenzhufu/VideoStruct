import { IBAnalysisTaskInfo } from './../collection-analyze-task/task-type';
import { EAnalysisSourceStatus } from './analysis-source-status-type';
// http://192.168.2.150:8090/pages/viewpage.action?pageId=5669415&preview=/5669415/5669419/%E8%A7%86%E9%A2%91%E7%BB%93%E6%9E%84%E5%8C%96.pdf
import { ESourceType, ETargetType } from 'sttypedefine';
import { IFAnalysisTaskInfo } from '../collection-analyze-task';
// import { string } from 'prop-types';

// 数据查看的类型
export enum EAnalysisUserType {
	All = 0, // 查看全部
	MySelf = 1, // 只看自己
	MyOriganition = 2 // 查看本单位
}

// 获取数据分析列表的请求参数类型
// 数据源---> 人体，人脸，***任务
export interface IFAnalysisDataSourceListReqPayload {
	page: number;
	pageSize: number;
	userType?: EAnalysisUserType;
	query?: string; // 查询字符串
	orgId?: string; // 单位id
	startTime?: string; // 接入开始时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00
	endTime?: string; // 接入结束时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00
	status?: EAnalysisSourceStatus[];
	sourceTypes?: ESourceType[];
	sourceIds?: string[];
	resourceStatus: 0 | 1; // 0 表示有效， 1表示删除
}

// 任务所有者的用户信息
export interface TaskUserType {
	id: string;
	name: string;
	account: string;
	orgId: string;
	organization: string;
	imageUrl: string;
	createTime: string;
	updateTime: string;
	startTime: string;
	endTime: string;
}

/*********************创建分析源 ************************/

export interface CreateAnalysisSourceReqPayloadType {
	sourceId: string; // 接入源Id
	sourceUrl: string; // 接入源url, 对于摄像头传入''
	sourceType: ESourceType; // 接入源类型
	sourceName: string; // 接入源名字
	sourceSize: number; // 接入源大小 (对于摄像头，传入0)
}

export interface IFAnalysisTaskProfileInfo {
	analyzeAlgorithm: string;
	analyzeTargetEnable: string;
	analyzeAttribute: string;
	id: string; //task id
	analyzeType: string; //  ETargetType，逗号分隔
	status: EAnalysisSourceStatus;
}

export enum EAnalysisSourceType {
	OffLineFile = 0,
	RtspV = 1,
	GB28181Live = 2, // 实时
	GB28181Record = 3, // 回播
	NVRCamera = 4
}

interface NVRParam {
	cameraId: string;
	cameraType: 'hikCamera';
}

export interface CreateAnalysisTaskPayloadType {
	channelName: string; //任务通道名称
	sourceType: EAnalysisSourceType; //接入源类型;0：离线文件；1：RTSP流
	fileParam?: FileParamtype; //离线文件分析参数;当sourceType=0时才有效
	rtspParam?: RtspUrlType; //Rtsp流分析参数;当sourceType=1时才有效
	imageUploadJson?: ImageUploadType; //图片识别参数;

	transType: TransType; //传输类型; 0：默认kafka通道1：url 回调方式; 2：kafka监听
	callbackParam?: CallbackParamType; //回调模式参数;transType=0时有效
	queueParam?: QueueParamType; //消息队列模式参数;transType=1时有效
	nvrParam?: NVRParam;
}

export enum TransType {
	Kafka = 0,
	Url = 1,
	KafkaListen = 2
}

export enum FileType { //文件类型;默认为0，0：离线视频；1：图片压缩包(目前只支持zip格式
	OffLineVideo = 0,
	Zip = 1
}

export interface FileParamtype {
	fileUrl: string; //文件路径；只支持http格式路径。如果只有本地文件请先调用文件上传接口
	fileType: FileType;
	fileSize: number; // 字节数
}

export interface RtspUrlType {
	rtspUrl: string; //rtsp流地址；第三方rtsp流地址
}

export function convertToSpecialTarget(target: ETargetType): string {
	console.log('----------------');
	switch (target) {
		case ETargetType.Face:
			return '0';
		case ETargetType.Body:
			return '1';
		case ETargetType.Vehicle:
			return '2';
		default:
			return '';
	}
}

export interface ImageUploadType {
	targetType: string; //检测类型；检测目标类型，逗号拼接多个值；0：人脸，1：人体, 2: 车辆，默认值：”0”
	faceEnable?: number; //人脸属性提取控制;长整形64位，其中7代表二进制”111”，最低位为1时使能目标位置，第二位为1使能特征值提取，第三位为1时使能属性提取，其他位暂时保留，目标位置可独立配置，特征值或属性提取需要依赖目标位置，即取值支持1，3，5，7；为了兼任不同版本，无此对象时默认全部使能
	faceAttrList?: string[];
	bodyEnable?: number;
	carEnable?: number;
}

export interface CallbackParamType {
	url: string;
}

export interface QueueParamType {
	key: string;
	url: string;
}
export interface IFUniqueDataSource {
	sourceId: string;
	sourceType: ESourceType;
}

/*********************更新分析源 ************************/

export interface UpdateAnalysisSourceReqPayloadType {
	id: string; // 分析源Id
	sourceName: string; // 接入源名字
	sourceSize?: number; // 接入源大小 (对于摄像头，传入0)
}

// 任务所属的接入源信息(简略信息)
export interface IBAnalysisSourceProfileInfo extends IFUniqueDataSource {
	id: string;
	sourceUrl: string;
	sourceName: string; // 接入源的名称
	sourceSize: number; // 接入源的大小
	userId: string; // 创建该接入源的用户id
	createTime: number; // 接入开始时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00
	updateTime: string; // 接入更新时间 YYYY-MM-DD HH:mm:ss  2018-01-02 23:00:00

	// 前端添加字段
	sourceSizeTip: string; // 文件大小提示
	createTimeTip: string;
}
// 前端：相同的，但是我们分开写
export interface IFAnalysisSourceProfileInfo
	extends IBAnalysisSourceProfileInfo {}

interface AnalysisBasicDetailInfo extends IBAnalysisSourceProfileInfo {
	status: EAnalysisSourceStatus;
	taskUsers: Array<TaskUserType>; // 所属的用户信息
	operateUsers: Array<TaskUserType>; // 操作的用户的信息
}

// 任务所属的接入源信息(详情信息)
export interface IBAnalysisSourceDetailInfo extends AnalysisBasicDetailInfo {
	analyzeTasks: Array<IBAnalysisTaskInfo>;
}
export interface IFAnalysisSourceDetailInfo extends AnalysisBasicDetailInfo {
	analyzeTasks: IFAnalysisTaskInfo[];
	// 前端添加
	statusTip: string; // 状态提示
}

// 获取数据源的分析结果请求payload type
export interface AnalysisResultResPayloadType {
	startTime?: string; // yyyy-MM-dd HH:mm:ss
	endTime?: string; // yyyy-MM-dd HH:mm:ss
	status?: EAnalysisSourceStatus;
}
