import * as React from 'react';
import * as H from 'history';
import { match } from 'react-router-dom';
import * as intl from 'react-intl-universal';
import Config from 'stutils/config';

import {
	ESourceType,
	ListType,
	IFDeviceInfo,
	ETargetType,
	IFStructuralInfo
} from 'sttypedefine';
import ModuleStyle from './assets/styles/index.module.scss';
import FileSelect from 'ifutils/file-select';

import {
	CollectionAnalysisSourceRequest,
	IFAnalysisDataSourceListReqPayload,
	IFAnalysisSourceDetailInfo,
	EAnalysisUserType,
	EAnalysisSourceStatus,
	CollectionTaskRequest,
	CreateAnalysisSourceReqPayloadType,
	IFAnalysisSourceProfileInfo,
	CraeteAnalysisTaskReqPayloadType
} from 'stutils/requests/collection-request';

// import * as JSZip from 'jszip';

import { debounce } from 'ifutils/debounce';

import {
	// Tabs,
	Button,
	message,
	// Input,
	Icon,
	DatePicker,
	Select,
	Pagination,
	Layout,
	Badge
} from 'antd';

import { guid } from 'ifutils/guid';

import AnalysisResultDetailListItemContainer from '../../submodules/analysis-result-detail-list-item-container';
import SourcePreviewer from 'stcontainers/source-previewer';
import Loading from 'stcomponents/loading';

import {
	VideoIconComponent,
	ZipIconComponent,
	EmptyIconComponent
} from 'stcomponents/icons';

import CameraSelectModal from 'stcontainers/camera-select-modal';
import SelectedFileListModal from '../../submodules/selected-file-list-modal';
import FilesUploadModal from '../../submodules/files-upload-modal';
import { SelectValue } from 'antd/lib/select';
import { RangePickerValue } from 'antd/lib/date-picker/interface';
import { FileUploadResultType } from 'stsrc/utils/requests/file-server-requests';
import * as moment from 'moment';
import { withErrorBoundary } from 'ifvendors/error-boundary';
import STComponent from 'stcomponents/st-component';
import IFRequest, { IFCancelTokenSource } from 'ifvendors/utils/requests';
import { saveSearchRangeMemo } from 'stsrc/pages/Search/views/search-result-page';
import { withUserInfo, UserInfoContextType } from 'stsrc/contexts';
import AnalysisProfileMenu, { MenuCountType } from '../AnalysisProfileMenu';

const { Sider, Content } = Layout;
// const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const Option = Select.Option;

interface OptionsType {
	id: string;
	value: string | number; // 传递给后台的value值
	defaultDisplayValue: string; // 前端默认显示的值(国际化)
	localeKey: string; // 国际化的key, displayValue从这儿计算得到
}

// const StatusOptios: Array<OptionsType> = [
// 	{
// 		id: guid(),
// 		value: EAnalysisSourceStatus.All,
// 		defaultDisplayValue: '全部状态',
// 		localeKey: 'ANALYSIS_ALL_STATUS'
// 	},
// 	{
// 		id: guid(),
// 		value: EAnalysisSourceStatus.RealTimeAnalysis,
// 		defaultDisplayValue: '实时接入',
// 		localeKey: 'COMMON_REAL_TIME_STAATUS'
// 	},
// 	{
// 		id: guid(),
// 		value: EAnalysisSourceStatus.Analysising,
// 		defaultDisplayValue: '正在解析',
// 		localeKey: 'COMMON_PROCESS_STATUS'
// 	},
// 	{
// 		id: guid(),
// 		value: EAnalysisSourceStatus.Finished,
// 		defaultDisplayValue: '解析完成',
// 		localeKey: 'COMMON_FINISHED_STATUS'
// 	}
// ];

const ViewListOptios: Array<OptionsType> = [
	{
		id: guid(),
		value: EAnalysisUserType.All,
		defaultDisplayValue: '查看全部',
		localeKey: 'ANALYSIS_VIEW_ALL'
	},
	{
		id: guid(),
		value: EAnalysisUserType.MyOriganition,
		defaultDisplayValue: '查看本单位',
		localeKey: 'ANALYSIS_VIEW_COMPANY'
	},
	{
		id: guid(),
		value: EAnalysisUserType.MySelf,
		defaultDisplayValue: '只看自己',
		localeKey: 'ANALYSIS_VIEW_MYSELF'
	}
];

interface ProptsType extends UserInfoContextType {
	match: match;
	history: H.History;
	location: H.Location;
}

type StateType = {
	currentPageAnalysisSourceList: Array<IFAnalysisSourceDetailInfo>; // 当前页面的数据源列表

	selectedAnalysisTaskInfoList: Array<IFAnalysisSourceDetailInfo>; // 所有选择的任务的id列表（包含所有选择的id）
	searchStr: string; // 搜索字符串
	startDate: string; // YYYY-MM-DD HH:mm:ss
	endDate: string; // YYYY-MM-DD HH:mm:ss

	status: EAnalysisSourceStatus; // 状态
	userType: number; // 查看数据的范围
	sourceType: ESourceType;

	page: number; //  分页
	pageSize: number;
	total: number;

	visible: boolean;
	isBatchState: boolean; // 是否批量操作状态

	showQuickSearchPanel: boolean;

	loading: boolean; // 是否加载中

	menuCountData: MenuCountType[];
};

const defaultPageSize = 10;

/** NOTE: 因为JSZip没有导出这个定义，我们手动创建
 * 实际的类型会比这个要多
 */
// type CompressedObject = {
// 	compressedSize: number;
// 	uncompressedSize: number;
// };

class AnalysisProfilePage extends STComponent<ProptsType, StateType> {
	orgId: string | null; // 组织id
	_source: IFCancelTokenSource | null; // 请求取消handle
	_timer: number | null;
	_loadingTimer: number | null;

	_unmounted: boolean;

	constructor(props: ProptsType) {
		super(props);

		this.state = {
			currentPageAnalysisSourceList: [],
			// taskResultsList: [],
			selectedAnalysisTaskInfoList: [],
			searchStr: '',
			startDate: String(
				this.formatTimeStamp(
					moment()
						.set('hour', 0)
						.set('minute', 0)
						.set('second', 0)
						.subtract('90', 'days')
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			endDate: String(
				this.formatTimeStamp(
					moment()
						.set('hour', 23)
						.set('minute', 59)
						.set('second', 59)
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			page: 1,
			pageSize: defaultPageSize,
			total: 0,
			sourceType: ESourceType.All,

			status: EAnalysisSourceStatus.Analysising,
			userType: EAnalysisUserType.All,
			isBatchState: false,

			visible: false,
			showQuickSearchPanel: false,
			loading: true,

			menuCountData: []
		};

		this._source = null;
		this._timer = null;
		this._loadingTimer = null;
		this._unmounted = false;
	}

	/***********生命周期 **********/

	componentDidMount() {
		this.refreshPage();
	}

	componentWillUnmount() {
		this._unmounted = true;
		this.cleanRequest();
		this.cleanTimer();
	}

	//时间转时间戳
	formatTimeStamp = (time: string) => {
		return new Date(time).getTime();
	};

	/**
	 * 搜索的回调
	 * @memberof AnalysisProfilePage
	 * @param {React.KeyboardEvent<HTMLInputElement>} event 字符串
	 * @returns {void}
	 */
	onSearch = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		this.setState(
			{
				page: 1,
				pageSize: defaultPageSize
			},
			() => {
				this.refreshPage();
			}
		);
	};

	onChangeSearchStr = (event: React.ChangeEvent<HTMLInputElement>): void => {
		this.setState({
			searchStr: event.currentTarget.value
		});
	};

	onSelected = (analysisSourceInfo: IFAnalysisSourceDetailInfo): void => {
		// 添加
		this.setState((prevState: StateType, props: ProptsType) => {
			return {
				selectedAnalysisTaskInfoList: [
					...prevState.selectedAnalysisTaskInfoList,
					analysisSourceInfo
				]
			};
		});
	};

	onUnselected = (analysisSourceInfo: IFAnalysisSourceDetailInfo): void => {
		this.setState((prevState: StateType, props: ProptsType) => {
			let newSelectedList = prevState.selectedAnalysisTaskInfoList.filter(
				(item: IFAnalysisSourceDetailInfo) => {
					if (
						analysisSourceInfo &&
						analysisSourceInfo.id &&
						// eslint-disable-next-line
						analysisSourceInfo.id == item.id
					) {
						return false;
					} else {
						return true;
					}
				}
			);

			return {
				selectedAnalysisTaskInfoList: newSelectedList
			};
		});
	};

	onShowMore = (analysisSourceInfo: IFAnalysisSourceDetailInfo) => {
		// if (!this.state.isBatchState) {
		this.linkToSearchPage([analysisSourceInfo]);
		// }
	};

	/**
	 * 转跳到详情页(暂未用到)
	 * @param {Array<IFAnalysisSourceDetailInfo>} list 数据源列表
	 * @returns {void} void
	 * @memberof AnalysisProfilePage
	 */
	linkToDetailPage(list: Array<IFAnalysisSourceDetailInfo>) {
		let subPaths = this.props.match.url.split('/');
		subPaths.splice(subPaths.length - 1, 1);
		let parentMatchUrl = subPaths.join('/');

		// NOTE: 将返回的Proxy转换成原始的Object对象
		let originalList: Array<IFAnalysisSourceDetailInfo> = [];
		for (let info of list) {
			originalList.push(Object.getPrototypeOf(info));
		}
		let locationProps: H.LocationDescriptorObject = {
			pathname: `${parentMatchUrl}/detail`,
			state: {
				sourceList: originalList
			}
		};
		this.props.history.push(locationProps);
	}

	linkToSearchPage(list: Array<IFAnalysisSourceDetailInfo>) {
		let subPaths = this.props.match.url.split('/');
		subPaths.splice(subPaths.length - 2, 2);
		let parentMatchUrl = subPaths.join('/');

		// NOTE: 将返回的Proxy转换成原始的Object对象
		let originalList: Array<IFAnalysisSourceDetailInfo> = [];
		for (let info of list) {
			originalList.push(Object.getPrototypeOf(info));
		}
		let locationProps: H.LocationDescriptorObject = {
			pathname: `${parentMatchUrl}/search/result`
			// state: {
			// 	sourceList: originalList
			// }
		};
		saveSearchRangeMemo(originalList);
		this.props.history.push(locationProps);
	}

	/**
	 * 改变过滤条件-任务状态的回调
	 * @memberof AnalysisProfilePage
	 * @param {SelectValue} value 当前选择的值
	 * @returns {void}
	 */
	onChangeFilterStatus = (value: SelectValue): void => {
		this.setState(
			{
				status: value as number,
				page: 1,
				pageSize: defaultPageSize
			},
			() => {
				this.refreshPage();
			}
		);
	};

	/**
	 * 改变过滤条件-查看自己或者查看全部
	 * @memberof AnalysisProfilePage
	 * @param {string} value 当前选择的值
	 * @returns {void}
	 */
	onChangeFilteruserType = (value: SelectValue): void => {
		this.setState(
			{
				userType: value as number
			},
			() => {
				this.refreshPage();
			}
		);
	};

	onSlectCalendar = (
		dates: RangePickerValue,
		dateStrings: [string, string]
	) => {
		let startData;
		let endData;
		if (dates[0]) {
			startData = moment(dates[0].valueOf())
				.set('hour', 0)
				.set('minute', 0)
				.set('second', 0)
				.valueOf();
			this.setState({
				startDate: String(startData)
			});
		}

		if (dates[1]) {
			endData = moment(dates[1].valueOf())
				.set('hour', 23)
				.set('minute', 59)
				.set('second', 59)
				.valueOf();
			this.setState({ endDate: String(endData) });
		}

		if (startData && endData) {
			this.setState(
				{
					startDate: String(startData),
					endDate: String(endData),
					page: 1,
					pageSize: defaultPageSize
				},
				() => {
					this.refreshPage();
				}
			);
		} else {
			this.setState(
				{
					startDate: '',
					endDate: '',
					page: 1,
					pageSize: defaultPageSize
				},
				() => {
					this.refreshPage();
				}
			);
		}
	};

	/**
	 * 显示大图
	 * @memberof AnalysisProfilePage
	 * @param {IFStructuralInfo} structuralItemInfo 结构化的数据
	 * @param {IFAnalysisSourceDetailInfo} analysisSourceInfo 结构化的数据
	 * @param {number} index 索引值
	 * @param {Array<IFStructuralInfo>} infoList 结构化的数据
	 * @returns {void}
	 */
	onShowPreview = (
		structuralItemInfo: IFStructuralInfo,
		analysisSourceInfo: IFAnalysisSourceDetailInfo,
		index: number,
		infoList: Array<IFStructuralInfo>
	) => {
		// let IconTag: React.ComponentClass | null = null;

		// if (analysisSourceInfo.sourceType === ESourceType.Camera) {
		// 	IconTag = CameraBlueIconComponent;
		// } else if (analysisSourceInfo.sourceType === ESourceType.Zip) {
		// 	IconTag = ZipRedIconComponent;
		// } else if (analysisSourceInfo.sourceType === ESourceType.Video) {
		// 	IconTag = VideoCameraGreenIconComponent;
		// }

		// let title = (
		// 	<div className={ModuleStyle['preview-title']}>
		// 		{IconTag && <IconTag />}
		// 		<div className={ModuleStyle['title']}>
		// 			{analysisSourceInfo.sourceName}
		// 		</div>
		// 		<div>{structuralItemInfo.time}</div>
		// 	</div>
		// );

		let handle = SourcePreviewer.show({
			sourceId: structuralItemInfo.sourceId,
			sourceType: structuralItemInfo.sourceType,
			structuralInfoId: structuralItemInfo.id,
			strucutralInfo: structuralItemInfo,
			originalImageId: structuralItemInfo.orignialImageId,
			originalImageUrl: structuralItemInfo.originalImageUrl,
			originalImageWidth: structuralItemInfo.originalImageWidth,
			originalImageHeight: structuralItemInfo.originalImageHeight,
			// title: title,
			disableLeftArrow: index <= 0,
			disableRightArrow: index >= infoList.length - 1,
			currentIndex: index,
			indicator: `${index + 1}/${infoList.length}`,
			onQuickSearch: function onQuickSearch() {
				// handle.destory();
				// self.props.history.push(`/structuralize/search/result`);
				window.open(`${window.location.origin}/structuralize/search/result`);
			},
			goNext: (currentIndex: number) => {
				let nextIndex = Math.max(
					0,
					Math.min(infoList.length - 1, currentIndex + 1)
				);
				let next: IFStructuralInfo = infoList[nextIndex];
				handle.update({
					sourceId: next.sourceId,
					sourceType: next.sourceType,
					structuralInfoId: next.id,
					strucutralInfo: next,
					currentIndex: nextIndex,
					originalImageId: next.orignialImageId,
					originalImageUrl: next.originalImageUrl,
					originalImageWidth: next.originalImageWidth,
					originalImageHeight: next.originalImageHeight,
					indicator: `${nextIndex + 1}/${infoList.length}`,
					disableLeftArrow: false,
					disableRightArrow: nextIndex >= infoList.length - 1
					// title: (
					// 	<div className={ModuleStyle['preview-title']}>
					// 		{IconTag && <IconTag />}
					// 		<div className={ModuleStyle['title']}>
					// 			{analysisSourceInfo.sourceName}
					// 		</div>
					// 		<div>{next.time}</div>
					// 	</div>
					// )
				});
			},
			goPrev: (currentIndex: number) => {
				let prevIndex = Math.max(
					0,
					Math.min(infoList.length - 1, currentIndex - 1)
				);
				let prev: IFStructuralInfo = infoList[prevIndex];
				handle.update({
					sourceId: prev.sourceId,
					sourceType: prev.sourceType,
					structuralInfoId: prev.id,
					strucutralInfo: prev,
					currentIndex: prevIndex,
					originalImageId: prev.orignialImageId,
					originalImageUrl: prev.originalImageUrl,
					originalImageWidth: prev.originalImageWidth,
					originalImageHeight: prev.originalImageHeight,
					indicator: `${prevIndex + 1}/${infoList.length}`,
					disableLeftArrow: prevIndex <= 0,
					disableRightArrow: false
					// title: (
					// 	<div className={ModuleStyle['preview-title']}>
					// 		{IconTag && <IconTag />}
					// 		<div className={ModuleStyle['title']}>
					// 			{analysisSourceInfo.sourceName}
					// 		</div>
					// 		<div>{prev.time}</div>
					// 	</div>
					// )
				});
			},
			onClose: function onClock() {
				handle.destory();
			},
			onOk: function onClock() {
				handle.destory();
			}
		});
	};

	onDragStart = (structuralItemInfo: IFStructuralInfo) => {
		this.setState({
			showQuickSearchPanel: true
		});
	};

	onDragEnd = () => {
		this.setState({
			showQuickSearchPanel: false
		});
	};

	/**
	 * 分页参数改变的回调
	 * @param {number} page page
	 * @param {number} pageSize pageSize
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onChangePagination = (page: number, pageSize: number) => {
		this.setState(
			{
				page: page,
				pageSize: pageSize,
				selectedAnalysisTaskInfoList: []
			},
			() => {
				this.refreshPage();
			}
		);
	};

	onChangeSourceType = (activeKey: string) => {
		let state = {
			sourceType: activeKey,
			page: 1,
			pageSize: defaultPageSize
		};
		// @ts-ignore
		this.setState(state, () => {
			this.refreshPage();
		});
	};

	onDrop = (data: Object, event: React.DragEvent<HTMLDivElement>) => {
		console.log('drop data', data);
	};

	/**
	 * 批量查看
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onBatchView = (): void => {
		if (this.state.selectedAnalysisTaskInfoList.length > 0) {
			this.linkToSearchPage(this.state.selectedAnalysisTaskInfoList);
		}
	};

	/**
	 * 退出批量状态
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onCancelBatch = (): void => {
		this.setState({
			isBatchState: false
		});
	};

	/**
	 * 进入批量状态
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onEnterBatch = (): void => {
		this.setState({
			isBatchState: true
		});
	};

	/**
	 * 接入实时数据
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onAccessRealData() {
		let self = this;
		let handler = CameraSelectModal.show({
			showTaskSelect: true,
			selectedList: [],
			onOk: function onOk(
				selectedList: Array<IFDeviceInfo>,
				tasks?: Array<ETargetType>
			) {
				// TODO: 处理
				handler.destory();
				if (tasks) {
					for (let device of selectedList) {
						self.createAnalysisSourceAndTasks(
							device.id,
							device.name,
							0,
							ESourceType.Camera,
							'',
							tasks
						);
					}

					setTimeout(() => {
						self.refreshPage();
					}, 1000);
				}
			},
			onCancel: function onCancel() {
				handler.destory();
			}
		});
	}
	// eslint-disable-next-line
	debouncedOnAccessRealData = debounce(this.onAccessRealData).bind(this);

	/**
	 * 接入离线视频
	 * @memberof AnalysisProfilePage
	 * @returns {void}
	 */
	onAccessOfflineData() {
		if (this.props.userInfo && this.props.userInfo.hasDataAceessAuthority) {
			FileSelect.showFileSelectDialog(
				{
					multiple: true,
					accept: Config.getSupportedVideoFormat().join(','),
					applyValidateFilter: false
				},
				(files: Array<File>, unValidFiles: Array<File>) => {
					let handle = SelectedFileListModal.show({
						files: files,
						typeValidFiles: unValidFiles,
						title: intl.get('ANALYSIS_ACCESS_OFFLINE_VIDEO').d('接入离线视频'),
						maxFileCount: 20,
						onCancel: () => {
							handle.destory();
						},
						onOk: (files: Array<File>, tasks: Array<ETargetType>) => {
							handle.destory();

							// 上传
							this.dealWithFileUpload(files, tasks, ESourceType.Video);
						}
					});
				}
			);
		} else {
			message.error(
				intl
					.get('ABALYSIS_NO_LOGIN_OR_NO_PERMISSION')
					.d('当前用户未登录或没有接入权限')
			);
		}
	}
	// eslint-disable-next-line
	debouncedOnAccessOfflineData = debounce(this.onAccessOfflineData).bind(this);

	/**
	 * 接入批量图片
	 * @returns {void}
	 * @memberof AnalysisProfilePage
	 */
	onAccessBatchData() {
		if (this.props.userInfo && this.props.userInfo.hasDataAceessAuthority) {
			FileSelect.showFileSelectDialog(
				{
					multiple: true,
					accept: Config.getSupportedRarFormat().join(','),
					applyValidateFilter: false
				},
				(files: Array<File>, unValidFiles: Array<File>) => {
					let handle = SelectedFileListModal.show({
						files: files,
						typeValidFiles: unValidFiles,
						title: intl.get('ANALYSIS_ACCESS_ZIP_FILE').d('接入批量图片'),
						maxFileCount: 20,
						onCancel: () => {
							handle.destory();
						},
						onOk: (files: Array<File>, tasks: Array<ETargetType>) => {
							handle.startLoading();

							let validationTasks = [];
							for (let file of files) {
								validationTasks.push(this.validataZipFile(file));
							}

							Promise.all(validationTasks)
								.then(() => {
									handle.destory();
									// 上传
									this.dealWithFileUpload(files, tasks, ESourceType.Zip);
								})
								.catch((error: Error) => {
									handle.stopLoading();
									console.error(error);
									message.error(error.message);
								});
						}
					});
					console.log('选择的文件', files);
				}
			);
		} else {
			message.error(
				intl
					.get('COMMON_NO_LOGIN_OR_NO_PERMISSION')
					.d('当前用户未登录或没有接入权限')
			);
		}
	}
	// eslint-disable-next-line
	debouncedOnAccessBatchData = debounce(this.onAccessBatchData).bind(this);

	async validataZipFile(file: File): Promise<boolean> {
		return true;
		// try {
		// 	let zip: JSZip = await JSZip.loadAsync(file);
		// 	// 判断文件是否合格
		// 	let hasImages = false;
		// 	const imageMaxSize = 10 * 1024 * 1024; // 10M
		// 	let validImageExtensions = Config.getSupportedPicFormat();
		// 	zip.forEach(function forEachZipContent(
		// 		relativePath: string,
		// 		zipEnter: JSZip.JSZipObject
		// 	) {
		// 		if (!zipEnter.dir) {
		// 			// 单个文件限制10M
		// 			// @ts-ignore  NOTE: _data为内部属性
		// 			let data: CompressedObject = zipEnter._data || {};

		// 			// 判断是否为图片
		// 			let index = zipEnter.name.lastIndexOf('.');
		// 			if (index !== -1) {
		// 				let ext = zipEnter.name.substr(index).toLowerCase();
		// 				if (validImageExtensions.indexOf(ext) !== -1) {
		// 					// 图片类型
		// 					hasImages = true;
		// 				} else {
		// 					console.log('no file.............');
		// 				}

		// 				if (data.uncompressedSize > imageMaxSize) {
		// 					throw new Error(
		// 						intl
		// 							.get('ANALYSIS_PICTURE_NO_BIG_THAN', { size: '10M' })
		// 							.d('单张图片最大支持10M')
		// 					);
		// 				}
		// 			}
		// 		}
		// 	});

		// 	if (hasImages) {
		// 		return true;
		// 	} else {
		// 		// 设置文件格式有误flag
		// 		console.log('error has image file............');
		// 		return Promise.reject(
		// 			new Error(
		// 				intl
		// 					.get('ANALYSIS_NO_VALID_PICTURES')
		// 					.d('压缩包未包含图片或图片格式不支持')
		// 			)
		// 		);
		// 	}
		// } catch (error) {
		// 	console.log('error file............');
		// 	console.error(error);
		// 	return Promise.reject(
		// 		new Error(intl.get('ANALYSIS_UNVALID_FILE').d('无效的文件'))
		// 	);
		// }
	}

	/**
	 * 上传处理逻辑
	 * @param {Array<File>} files 文件列表
	 * @param {Array<ETargetType>} tasks 任务类型数组
	 * @param {ESourceType} type 文件类型
	 * @returns {void} void
	 */
	dealWithFileUpload(
		files: Array<File>,
		tasks: Array<ETargetType>,
		type: ESourceType
	) {
		let self = this;
		let sucessCount = 0;
		let fileModalHandle = FilesUploadModal.show({
			uploadFiles: files,
			uploadSuccess: function(fileInfo: FileUploadResultType) {
				// 创建数据源和任务
				self
					.createAnalysisSourceAndTasks(
						fileInfo.id,
						fileInfo.fileName,
						fileInfo.fileSize,
						type,
						fileInfo.fileUrl,
						tasks
					)
					.then(() => {
						// 计算什么时候全部成功
						sucessCount++;
						if (sucessCount >= files.length) {
							// 销毁
							setTimeout(() => {
								fileModalHandle.destory();
								// 重新获取数据
								self.refreshPage();
							}, 1 * 1000);
						}
					})
					.catch((error: Error) => {
						console.error(error);
						message.error(error.message);
						fileModalHandle.destory();
					});
				console.log('file uploaded..........');
			},
			onCancel: () => {
				fileModalHandle.destory();
			},
			onError: (error: Error) => {
				message.error(error.message);
				console.error(error);
				setTimeout(() => {
					fileModalHandle.destory();
				}, 1 * 1000);
			}
		});
	}

	onSelectSource = () => {
		switch (this.state.sourceType) {
			case ESourceType.Camera:
				// this.debouncedOnAccessRealData();
				this.props.history.push(`/structuralize/setting/cameras`);
				break;

			case ESourceType.Video:
				this.debouncedOnAccessOfflineData();
				break;

			case ESourceType.Zip:
				this.debouncedOnAccessBatchData();
				break;
		}
	};

	/**************请求有关 *********/

	cleanRequest() {
		if (this._source) {
			this._source.cancel();
			this._source = null;
		}
	}

	cleanTimer() {
		if (this._timer) {
			window.clearTimeout(this._timer);
			this._timer = null;
		}

		if (this._loadingTimer) {
			window.clearTimeout(this._loadingTimer);
			this._loadingTimer = null;
		}
	}

	/**
	 * 获得分析源列表
	 * @returns {Promise<ListType<IFAnalysisSourceDetailInfo>>} 数据源列表
	 * @memberof AnalysisProfilePage
	 */
	async getSourceList(): Promise<ListType<IFAnalysisSourceDetailInfo>> {
		this.cleanRequest();

		let payload: IFAnalysisDataSourceListReqPayload = {
			page: this.state.page,
			pageSize: this.state.pageSize,
			query: this.state.searchStr,
			userType: this.state.userType
		};

		if (this.state.status === EAnalysisSourceStatus.Analysising) {
			// NOTE: 把waiting状态也看成正在解析
			payload['status'] = [
				EAnalysisSourceStatus.Waiting,
				EAnalysisSourceStatus.Analysising
			];
		} else {
			if (this.state.status !== EAnalysisSourceStatus.All) {
				payload['status'] = [this.state.status];
			} else {
				// NOTE: 选择了所有的，排除无效的
				payload['status'] = [
					EAnalysisSourceStatus.Analysising,
					EAnalysisSourceStatus.Finished,
					EAnalysisSourceStatus.RealTimeAnalysis,
					EAnalysisSourceStatus.Waiting
				];
			}
		}

		if (this.state.sourceType !== ESourceType.All) {
			payload['sourceTypes'] = [this.state.sourceType];
		}

		if (this.state.startDate) {
			payload['startTime'] = this.state.startDate;
		}

		if (this.state.endDate) {
			payload['endTime'] = this.state.endDate;
		}

		this._source = IFRequest.getCancelSource();
		return CollectionAnalysisSourceRequest.getAnalysisSourceList(payload, {
			cancelToken: this._source.token
		});
	}

	async getPageData() {
		// 选获取数据源列表
		let sources: ListType<
			IFAnalysisSourceDetailInfo
		> = await this.getSourceList();
		console.log('czf_sources', sources);

		// 返回数据
		return {
			sourceList: sources.list,
			total: sources.total
		};
	}

	/**
	 * 创建数据源和任务
	 * @param {string} sourceId id
	 * @param {string} sourceName 名字
	 * @param {number} sourceSize 大小
	 * @param {ESourceType} sourceType 数据源类型
	 * @param {string} sourceUrl 数据源地址, 对于摄像头类型的，此致为空字符串
	 * @param {Array<ETargetType>} tasks 任务类型
	 * @return {Promise<void>} 返回值
	 */
	createAnalysisSourceAndTasks(
		sourceId: string,
		sourceName: string,
		sourceSize: number,
		sourceType: ESourceType,
		sourceUrl: string,
		tasks: Array<ETargetType>
	): Promise<void> {
		let payload: CreateAnalysisSourceReqPayloadType = {
			sourceId: sourceId,
			sourceType: sourceType,
			sourceName: sourceName,
			sourceSize: sourceSize,
			sourceUrl: sourceUrl
		};
		return CollectionAnalysisSourceRequest.createAnalysisSource(payload).then(
			(sourceInfo: IFAnalysisSourceProfileInfo) => {
				// 创建任务
				let taskPayload: CraeteAnalysisTaskReqPayloadType = {
					resourceId: sourceInfo.id,
					analyzeTypes: tasks.join(',')
				};
				CollectionTaskRequest.createAnalysisTask(taskPayload)
					.then(() => {
						// do nothing
						// 创建成功
						return;
					})
					.catch((error: Error) => {
						// console.error(error);
						// message.error(error.message);
						throw error;
					});
			}
		);
	}

	_needAutoRefresh() {
		for (let item of this.state.currentPageAnalysisSourceList) {
			if (item.status !== EAnalysisSourceStatus.Finished) {
				return true;
			}
		}

		return false;
	}

	refreshPage(showLoadingState: boolean = true) {
		if (showLoadingState) {
			this.setState({
				loading: true
			});
		}

		this.cleanTimer();
		this.getPageData()
			.then(
				(data: {
					sourceList: Array<IFAnalysisSourceDetailInfo>;
					total: number;
				}) => {
					let list: Array<IFAnalysisSourceDetailInfo> = data['sourceList'];
					let loading = showLoadingState;
					if (list.length <= 0) {
						loading = false;
					}
					this.setState(
						{
							total: data['total'],
							currentPageAnalysisSourceList: list,
							loading: loading
						},
						() => {
							if (loading) {
								// loading状态由container组件的onsuccess和onFaild控制，
								// 但是会出现container不触发任何的请求（update不触发请求），所以只能做个定时器了
								this._loadingTimer = window.setTimeout(() => {
									this.setState({
										loading: false
									});
								}, 2 * 1000);
							}
							// 判断是否需要刷新页面
							if (this._needAutoRefresh()) {
								// NOTE: 20s定时任务
								this._timer = window.setTimeout(() => {
									this.refreshPage(false);
								}, 20 * 1000);
							}
						}
					);
				}
			)
			.catch((error: Error) => {
				if (!IFRequest.isCancel(error)) {
					console.error(error);
					message.error(error.message);
				}

				this.setState({
					loading: false
				});
			});

		this._getCountData();
	}

	onLoadSuccessed = () => {
		// 一个返回就当作loading完成了
		this.setState({
			loading: false
		});
	};

	onLoadedFaild = (error: Error) => {
		message.error(error.message);

		// 失败了也当成loading完成，
		// NOTE: 这是多个item componet的组件回调
		// 所以，小心了
		this.setState({
			loading: false
		});
	};

	/**
	 * 菜单点击
	 * @param {string} activeKey 选中key
	 * @return {void}
	 */
	handleClickMenu = (activeKey: string) => {
		//正在解析
		if (activeKey === String(EAnalysisSourceStatus.Analysising)) {
			this.setState(
				{
					status: Number(activeKey) as EAnalysisSourceStatus,
					page: 1,
					pageSize: defaultPageSize
				},
				() => {
					this.refreshPage();
				}
			);
		} else {
			const state = {
				sourceType: activeKey,
				page: 1,
				pageSize: defaultPageSize,
				status: EAnalysisSourceStatus.All
			};
			// @ts-ignore
			this.setState(state, () => {
				this.refreshPage();
			});
		}
	};

	/**
	 * 获取菜单统计数量
	 * @returns{void}
	 */
	_getCountData = () => {
		// 选获取数据源列表
		let menuCountData: MenuCountType[] = [];
		//正在解析
		let payload1: IFAnalysisDataSourceListReqPayload = {
			page: this.state.page,
			pageSize: this.state.pageSize,
			query: this.state.searchStr,
			userType: this.state.userType,
			status: [EAnalysisSourceStatus.Waiting, EAnalysisSourceStatus.Analysising]
		};
		if (this.state.startDate) {
			payload1['startTime'] = this.state.startDate;
		}
		if (this.state.endDate) {
			payload1['endTime'] = this.state.endDate;
		}
		console.log('czf_payload1', payload1);
		let AnalysisingFun = CollectionAnalysisSourceRequest.getAnalysisSourceList(
			payload1
		);

		let payload2: IFAnalysisDataSourceListReqPayload = {
			page: this.state.page,
			pageSize: this.state.pageSize,
			query: this.state.searchStr,
			userType: this.state.userType,
			status: [
				EAnalysisSourceStatus.Analysising,
				EAnalysisSourceStatus.Finished,
				EAnalysisSourceStatus.RealTimeAnalysis,
				EAnalysisSourceStatus.Waiting
			],
			sourceTypes: [ESourceType.Camera]
		};
		if (this.state.startDate) {
			payload2['startTime'] = this.state.startDate;
		}
		if (this.state.endDate) {
			payload2['endTime'] = this.state.endDate;
		}

		console.log('czf_payload2', payload2);
		let cameraFun = CollectionAnalysisSourceRequest.getAnalysisSourceList(
			payload2
		);

		let payload3: IFAnalysisDataSourceListReqPayload = {
			page: this.state.page,
			pageSize: this.state.pageSize,
			query: this.state.searchStr,
			userType: this.state.userType,
			status: [
				EAnalysisSourceStatus.Analysising,
				EAnalysisSourceStatus.Finished,
				EAnalysisSourceStatus.RealTimeAnalysis,
				EAnalysisSourceStatus.Waiting
			],
			sourceTypes: [ESourceType.Video]
		};
		if (this.state.startDate) {
			payload3['startTime'] = this.state.startDate;
		}
		if (this.state.endDate) {
			payload3['endTime'] = this.state.endDate;
		}
		console.log('czf_payload3', payload3);
		let videoFun = CollectionAnalysisSourceRequest.getAnalysisSourceList(
			payload3
		);

		let payload4: IFAnalysisDataSourceListReqPayload = {
			page: this.state.page,
			pageSize: this.state.pageSize,
			query: this.state.searchStr,
			userType: this.state.userType,
			status: [
				EAnalysisSourceStatus.Analysising,
				EAnalysisSourceStatus.Finished,
				EAnalysisSourceStatus.RealTimeAnalysis,
				EAnalysisSourceStatus.Waiting
			],
			sourceTypes: [ESourceType.Zip]
		};
		if (this.state.startDate) {
			payload4['startTime'] = this.state.startDate;
		}
		if (this.state.endDate) {
			payload4['endTime'] = this.state.endDate;
		}
		console.log('czf_payload4', payload4);
		let zipFun = CollectionAnalysisSourceRequest.getAnalysisSourceList(
			payload4
		);

		Promise.all([AnalysisingFun, cameraFun, videoFun, zipFun]).then((res) => {
			console.log('czf_res', res);

			menuCountData = [
				{ status: EAnalysisSourceStatus.Analysising, count: res[0].total },
				{ type: ESourceType.Camera, count: res[1].total },
				{ type: ESourceType.Video, count: res[2].total },
				{ type: ESourceType.Zip, count: res[3].total }
			];
			//  menuCountData;
			this.setState({
				menuCountData
			});
		});
	};

	_renderOptions(list: Array<OptionsType>) {
		return list.map((status: OptionsType) => {
			return (
				<Option value={status.value} key={status.id}>
					{intl.get(status.localeKey).d(status.defaultDisplayValue)}
				</Option>
			);
		});
	}

	render() {
		let ContentElment: React.ReactNode = null;

		if (
			this.state.currentPageAnalysisSourceList.length <= 0 &&
			!this.state.loading
		) {
			let sourceTip = '';
			switch (this.state.sourceType) {
				case ESourceType.Camera:
					sourceTip = intl
						.get('COMMON_SOURCE_TYPE_REALTIME_VIDEO')
						.d('实时视频');
					break;

				case ESourceType.Video:
					sourceTip = intl
						.get('COMMON_SOURCE_TYPE_OFFLINE_VIDEO')
						.d('离线视频');
					break;

				case ESourceType.Zip:
					sourceTip = intl.get('COMMON_SOURCE_TYPE_BATCH_IMAGES').d('批量图片');
					break;
			}
			ContentElment = (
				<div className={ModuleStyle['datasource-content']}>
					<div className={ModuleStyle['empty-data-history-tip']}>
						<EmptyIconComponent className={ModuleStyle['empty-icon']} />
						<div className={ModuleStyle['tip-container']}>
							<div style={{ marginBottom: '10px' }}>
								{this.state.sourceType !== ESourceType.Camera
									? intl
											.get('ANALYSIS_NO_DATA', { tip: sourceTip })
											.d(`暂时没有${sourceTip}数据，请在右上角选择接入数据`)
									: intl
											.get('ANALYSIS_NO_DATA', { tip: sourceTip })
											.d(`暂时没有${sourceTip}数据`)}
							</div>
							{this.state.sourceType !== ESourceType.All && (
								<Button type="primary" onClick={this.onSelectSource}>
									{this.state.sourceType !== ESourceType.Camera
										? intl.get('ANALYSIS_START_ACCESS').d('开始接入')
										: intl.get('ANALYSIS_START_ADD_CAMERA').d('添加摄像头')}
								</Button>
							)}
						</div>
					</div>
					<Loading
						show={this.state.loading}
						tip={intl.get('COMMON_LOADING').d('加载中....')}
					/>
				</div>
			);
		} else {
			ContentElment = (
				<div className={ModuleStyle['datasource-content']}>
					<div className={ModuleStyle['datasource-list']}>
						{this.state.currentPageAnalysisSourceList.map(
							(item: IFAnalysisSourceDetailInfo) => {
								return (
									<AnalysisResultDetailListItemContainer
										key={item.id}
										// @ts-ignore
										analysisSourceInfo={item}
										className={ModuleStyle['list-item']}
										selected={this.state.isBatchState}
										onSelected={this.onSelected}
										onUnselected={this.onUnselected}
										onShowMore={this.onShowMore}
										onClickItem={this.onShowPreview}
										onDragStart={this.onDragStart}
										onDragEnd={this.onDragEnd}
										onLoadSuccessed={this.onLoadSuccessed}
										onLoadedFaild={this.onLoadedFaild}
									/>
								);
							}
						)}
					</div>
					<Loading
						show={this.state.loading}
						tip={intl.get('COMMON_LOADING').d('加载中....')}
					/>
					{
						<div className={ModuleStyle['datasource-pagination']}>
							<Pagination
								onChange={this.onChangePagination}
								total={this.state.total}
								current={this.state.page}
								pageSize={this.state.pageSize}
								showTotal={(total) =>
									`共 ${Math.ceil(
										total / this.state.pageSize
									)} 页 , ${total} 个文件`
								}
								hideOnSinglePage={this.state.total === 0}
							/>
						</div>
					}
				</div>
			);
		}

		return (
			<div className={ModuleStyle['datasource-container']}>
				<Layout style={{ height: '100%', width: '100%' }}>
					<Sider width={264}>
						<AnalysisProfileMenu
							menuCountData={this.state.menuCountData}
							onClick={this.handleClickMenu}
						/>
						<div className={ModuleStyle['datasource-acceso-wraper']}>
							<div>{intl.get('--').d('资源接入')} </div>
							{/* <Upload {...props}> */}
							<Badge count={5} showZero={true} />
							<Button type="primary">
								<Icon type="upload" /> {intl.get('--').d('上传文件')}
							</Button>
							{/* </Upload> */}
						</div>
					</Sider>
					<Layout style={{ overflowY: 'hidden' }}>
						{/* <Header>Header</Header> */}
						<Content>
							<div className={ModuleStyle['datasource-type-filter-panel']}>
								<div className={`${ModuleStyle['datasource-type-bar']}`}>
									{/* <Tabs
										className={ModuleStyle['tabs']}
										defaultActiveKey={ESourceType.All}
										onChange={this.onChangeSourceType}
									>
										<TabPane
											tab={intl.get('ANALYSIS_SOURCE_TYPE_ALL').d('全部类型')}
											key={ESourceType.All}
										/>
										<TabPane
											tab={intl
												.get('ANALYSIS_SOURCE_TYPE_REALTIME')
												.d('实时视频')}
											key={ESourceType.Camera}
										/>
										<TabPane
											tab={intl
												.get('ANALYSIS_SOURCE_TYPE_OFFLINE')
												.d('离线视频')}
											key={ESourceType.Video}
										/>
										<TabPane
											tab={intl.get('ANALYSIS_SOURCE_TYPE_BATCH').d('批量图片')}
											key={ESourceType.Zip}
										/>
									</Tabs> */}
									<div className={ModuleStyle['datasource-select-content']}>
										<div className={ModuleStyle['datasource-select-tip']}>
											{intl.get('ANALYSIS_DATA_ACCESS').d('数据接入') + ':'}
										</div>
										<Button
											className={`${ModuleStyle['datasource-select']} ${
												ModuleStyle['offline-select']
											}`}
											onClick={this.debouncedOnAccessOfflineData}
										>
											<VideoIconComponent />
											{intl
												.get('ANALYSIS_OFFLINE_VIDEO_ACCESS')
												.d('导入离线视频')}
										</Button>
										<Button
											className={`${ModuleStyle['datasource-select']} ${
												ModuleStyle['batch-select']
											}`}
											onClick={this.debouncedOnAccessBatchData}
										>
											<ZipIconComponent />
											{intl
												.get('ANALYSIS_BATCH_IMAGE_ACCESS')
												.d('导入批量图片')}
										</Button>
									</div>
								</div>
								<div className={`${ModuleStyle['datasource-filter-panel']}`}>
									{/* <Input
										className={ModuleStyle['search-input']}
										placeholder={intl
											.get('ANALYSIS_FILENAME_CAMERA')
											.d('文件名/摄像头')}
										prefix={<Icon type="search" style={{ color: 'white' }} />}
										value={this.state.searchStr}
										onPressEnter={this.onSearch}
										onChange={this.onChangeSearchStr}
									/> */}
									{/* <div className={ModuleStyle['access-date']}>
										{intl.get('ANALYSIS_ACCESS_TIME').d('接入时间') + ':'}
									</div> */}
									<RangePicker
										className={ModuleStyle['range-picker']}
										onChange={this.onSlectCalendar}
										defaultValue={[
											moment()
												.set('hour', 0)
												.set('minute', 0)
												.set('second', 0)
												.subtract('90', 'days'),
											moment()
												.set('hour', 23)
												.set('minute', 59)
												.set('second', 59)
										]}
									/>
									{/* <Select
										className={ModuleStyle['status-select']}
										value={this.state.status}
										style={{ width: 120 }}
										onChange={this.onChangeFilterStatus}
									>
										{this._renderOptions(StatusOptios)}
									</Select> */}
									<Select
										className={ModuleStyle['view-scope-select']}
										value={this.state.userType}
										style={{ width: 120 }}
										onChange={this.onChangeFilteruserType}
									>
										{this._renderOptions(ViewListOptios)}
									</Select>
									{/* {!this.state.isBatchState && (
										<Button
											className={ModuleStyle['batch-operation-button']}
											onClick={this.onEnterBatch}
										>
											{intl.get('ANALYSIS_BATCH_OPERATION').d('批量操作')}
										</Button>
									)}
									{this.state.isBatchState && (
										<Button
											className={ModuleStyle['cancel-button']}
											onClick={this.onCancelBatch}
										>
											{intl.get('ANALYSIS_CANCLE_OPERATION').d('取消操作')}
										</Button>
									)} */}
									{this.state.isBatchState && (
										<Button
											onClick={this.onBatchView}
											disabled={
												this.state.selectedAnalysisTaskInfoList.length === 0
											}
											className={
												this.state.selectedAnalysisTaskInfoList.length === 0
													? ModuleStyle['batch-operation-button-disabled']
													: ModuleStyle['batch-operation-button']
											}
										>
											{intl.get('ANALYSIS_BATCVH_VIEW').d('批量查看')}
										</Button>
									)}
								</div>
							</div>
							{ContentElment}
						</Content>
						{/* <Footer>Footer</Footer> */}
					</Layout>
				</Layout>
				{/* <div>
					<AnalysisProfileMenu />
				</div>
				<div className={ModuleStyle['datasource-right']}>
					<div className={ModuleStyle['datasource-type-filter-panel']}>
						<div className={`${ModuleStyle['datasource-type-bar']}`}>
							<Tabs
								className={ModuleStyle['tabs']}
								defaultActiveKey={ESourceType.All}
								onChange={this.onChangeSourceType}
							>
								<TabPane
									tab={intl.get('ANALYSIS_SOURCE_TYPE_ALL').d('全部类型')}
									key={ESourceType.All}
								/>
								<TabPane
									tab={intl.get('ANALYSIS_SOURCE_TYPE_REALTIME').d('实时视频')}
									key={ESourceType.Camera}
								/>
								<TabPane
									tab={intl.get('ANALYSIS_SOURCE_TYPE_OFFLINE').d('离线视频')}
									key={ESourceType.Video}
								/>
								<TabPane
									tab={intl.get('ANALYSIS_SOURCE_TYPE_BATCH').d('批量图片')}
									key={ESourceType.Zip}
								/>
							</Tabs>
							<div className={ModuleStyle['datasource-select-content']}>
								<div className={ModuleStyle['datasource-select-tip']}>
									{intl.get('ANALYSIS_DATA_ACCESS').d('数据接入') + ':'}
								</div>
								<Button
									className={`${ModuleStyle['datasource-select']} ${
										ModuleStyle['offline-select']
									}`}
									onClick={this.debouncedOnAccessOfflineData}
								>
									<VideoIconComponent />
									{intl.get('ANALYSIS_OFFLINE_VIDEO_ACCESS').d('导入离线视频')}
								</Button>
								<Button
									className={`${ModuleStyle['datasource-select']} ${
										ModuleStyle['batch-select']
									}`}
									onClick={this.debouncedOnAccessBatchData}
								>
									<ZipIconComponent />
									{intl.get('ANALYSIS_BATCH_IMAGE_ACCESS').d('导入批量图片')}
								</Button>
							</div>
						</div>
						<div className={`${ModuleStyle['datasource-filter-panel']}`}>
							<Input
								className={ModuleStyle['search-input']}
								placeholder={intl
									.get('ANALYSIS_FILENAME_CAMERA')
									.d('文件名/摄像头')}
								prefix={<Icon type="search" style={{ color: 'white' }} />}
								value={this.state.searchStr}
								onPressEnter={this.onSearch}
								onChange={this.onChangeSearchStr}
							/>
							<div className={ModuleStyle['access-date']}>
								{intl.get('ANALYSIS_ACCESS_TIME').d('接入时间') + ':'}
							</div>
							<RangePicker
								className={ModuleStyle['range-picker']}
								onChange={this.onSlectCalendar}
								defaultValue={[
									moment()
										.set('hour', 0)
										.set('minute', 0)
										.set('second', 0)
										.subtract('90', 'days'),
									moment()
										.set('hour', 23)
										.set('minute', 59)
										.set('second', 59)
								]}
							/>
							<Select
								className={ModuleStyle['status-select']}
								value={this.state.status}
								style={{ width: 120 }}
								onChange={this.onChangeFilterStatus}
							>
								{this._renderOptions(StatusOptios)}
							</Select>
							<Select
								className={ModuleStyle['view-scope-select']}
								value={this.state.userType}
								style={{ width: 120 }}
								onChange={this.onChangeFilteruserType}
							>
								{this._renderOptions(ViewListOptios)}
							</Select>
							{!this.state.isBatchState && (
								<Button
									className={ModuleStyle['batch-operation-button']}
									onClick={this.onEnterBatch}
								>
									{intl.get('ANALYSIS_BATCH_OPERATION').d('批量操作')}
								</Button>
							)}
							{this.state.isBatchState && (
								<Button
									className={ModuleStyle['cancel-button']}
									onClick={this.onCancelBatch}
								>
									{intl.get('ANALYSIS_CANCLE_OPERATION').d('取消操作')}
								</Button>
							)}
							{this.state.isBatchState && (
								<Button
									onClick={this.onBatchView}
									disabled={
										this.state.selectedAnalysisTaskInfoList.length === 0
									}
									className={
										this.state.selectedAnalysisTaskInfoList.length === 0
											? ModuleStyle['batch-operation-button-disabled']
											: ModuleStyle['batch-operation-button']
									}
								>
									{intl.get('ANALYSIS_BATCVH_VIEW').d('批量查看')}
								</Button>
							)}
						</div>
					</div>
					{ContentElment}
				</div> */}
			</div>
		);
	}
}

export default withErrorBoundary(withUserInfo(AnalysisProfilePage));
