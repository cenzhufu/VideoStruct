import * as React from 'react';
import { match, withRouter } from 'react-router-dom';
import {
	Button,
	DatePicker,
	Input,
	Icon,
	Table,
	message,
	Pagination,
	Modal,
	Empty
} from 'antd';
import * as intl from 'react-intl-universal';
import * as moment from 'moment';
import {
	CollectionRecordRequest,
	EAnalysisSourceStatus,
	CollectionAnalysisSourceRequest,
	IFAnalysisSourceDetailInfo,
	EAnalysisUserType,
	IFAnalysisTaskInfo,
	isAnalysisSourceProcessing,
	isAnalysisSourceWaiting,
	isAnalysisSourceFinished
} from 'stutils/requests/collection-request';
import ModuleStyle from './assets/styles/index.module.scss';
import { RangePickerPresetRange } from 'antd/lib/date-picker/interface';
import { IFUserInfo, ESourceType, ETargetType } from 'stsrc/type-define';
import StringTool from 'stutils/foundations/string';
import { ColumnProps } from 'antd/lib/table';
import { saveSearchRangeMemo } from 'stsrc/pages/Search/views/search-result-page';
import {
	DataServerRequests,
	IStatisticItemInfo
} from 'stutils/requests/data-server-requests';
import * as H from 'history';
import STComponent from 'stcomponents/st-component';
import DeleteConfirmModal from 'stsrc/components/delete-confirm-modal';
import IFRequest, { IFCancelTokenSource } from 'ifvendors/utils/requests';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';

const { RangePicker } = DatePicker;

let timer: any = null;

interface Counts {
	id: string;
	count: number;
}
interface PropsType {
	userInfo: IFUserInfo;
	match: match;
	history: H.History;
}
interface StateType {
	searchStr: string;
	tableHeight: number;
	startDate: string;
	endDate: string;
	dataList: Array<IFAnalysisSourceDetailInfo>;
	selectedlist: Array<IFAnalysisSourceDetailInfo>;
	loading: boolean;
	countArr: Counts[];

	showconfirmedModal: boolean; //二次确认
	page: number;
	pageSize: number;
	total: number;
	visible: boolean;
	recordId: string;
	confirmLoading: boolean;
	// pagination: Object; //删除loading
}

function none() {}
const DAYS: number = 90; //今天往前90天
class UploadRecord extends STComponent<PropsType, StateType> {
	_source: IFCancelTokenSource | null; // 请求取消handle
	constructor(props: PropsType) {
		super(props);
		this.state = {
			searchStr: '', //搜索词
			tableHeight: 792, //table高度
			dataList: [], //上传记录
			selectedlist: [], //选中列表
			loading: true,
			// startDate: '',
			// endDate: '',
			startDate: moment()
				.set('hour', 0)
				.set('minute', 0)
				.set('second', 0)
				.subtract(DAYS, 'days')
				.format('YYYY-MM-DD HH:mm:ss'), //开始日期
			endDate: moment()
				.set('hour', 23)
				.set('minute', 59)
				.set('second', 59)
				.format('YYYY-MM-DD HH:mm:ss'), //借宿日期
			countArr: [], //解析张数d

			showconfirmedModal: false,
			page: 1,
			pageSize: 10,
			total: 0,
			visible: false,
			recordId: '',
			confirmLoading: false
			// pagination: {}
		};
	}

	static ownName() {
		return 'user-center-record';
	}

	componentDidMount() {
		this.resizeTable();
		window.addEventListener('resize', this.resizeTable);

		// 新增数据源
		eventEmiiter.addListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);

		// 删除正在解析的数据源
		eventEmiiter.addListener(
			EventType.deleteAnalysisingSource,
			this.onDeleteAnalysisingInfo
		);

		//请求加载数据
		this.getUploadRecordData();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeTable);
		this._cancleRequest();

		eventEmiiter.removeListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);

		eventEmiiter.removeListener(
			EventType.deleteAnalysisingSource,
			this.onDeleteAnalysisingInfo
		);
	}

	addNewAnalysisSource = () => {
		this.getUploadRecordData();
	};

	onDeleteAnalysisingInfo = (id: string, from: string) => {
		if (from !== UploadRecord.ownName()) {
			this.getUploadRecordData();
		}
	};

	resizeTable = () => {
		const windowHeight = window.innerHeight;
		// const tableHeight = windowHeight - 300;
		const tableHeight = windowHeight - 380;
		this.setState({ tableHeight });
	};

	/**
	 * 取消之前发的同一个未完成的请求
	 * @returns {void}
	 */
	_cancleRequest = () => {
		if (this._source) {
			this._source.cancel();
		}
		this._source = IFRequest.getCancelSource();
	};
	/**
	 * 获取上传记录数据
	 * @memberof UploadRecord
	 * @returns {void}
	 */
	getUploadRecordData = () => {
		this._cancleRequest();
		this.setState({ loading: true });
		const { page, pageSize, searchStr, startDate, endDate } = this.state;
		const userType: EAnalysisUserType = EAnalysisUserType.MySelf;
		CollectionRecordRequest.getUploadRecordList(
			searchStr,
			startDate ? String(moment(startDate).valueOf()) : '',
			endDate ? String(moment(endDate).valueOf()) : '',
			userType,
			page,
			pageSize,
			{
				//@ts-ignore
				cancelToken: this._source.token
			}
		)
			.then((res) => {
				console.log(res);

				if (res && res.list) {
					this.setState(
						{
							dataList: res.list,
							total: res.total
						},
						() => {
							this._getAllCount();
						}
					);
				}

				this.setState({
					loading: false
				});
			})
			.catch((error) => {
				console.error(error);
				message.error(error.message);
				this.setState({
					loading: false
				});
			});
	};

	/**
	 * 遍历dataList 获取sourceId
	 * @returns {void}
	 */
	_getAllCount = (): void => {
		const { dataList } = this.state;
		for (const item of dataList) {
			this._counntServer(item.sourceId, item.sourceType);
		}
	};

	/**
	 * 请求数据统计服务
	 * @param {string} sourceId sourceId
	 * @param {ESourceType} sourceType sourceType
	 * @returns {void}
	 */
	_counntServer = (sourceId: string, sourceType: ESourceType) => {
		DataServerRequests.getTotalAnalysisStaticResult({
			sources: [
				{
					sourceId: sourceId,
					sourceType: sourceType
				}
			]
		})
			.then((res: Array<IStatisticItemInfo>) => {
				if (res && res.length > 0) {
					let list: Counts[] = [
						{
							id: sourceId,
							count: res[0].statisticalResult
						}
					];
					this.setState({
						countArr: [...this.state.countArr, ...list]
					});
				}
			})
			.catch((error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	handleChangePage = (page: number, pageSize: number) => {
		this.setState(
			{
				page,
				pageSize
			},
			this.getUploadRecordData
		);
	};
	/**
	 * 获取某条记录的解析张数
	 * @param {string} sourceId sourceId
	 * @returns {number} 张数
	 */
	_getRecordCount = (sourceId: string): number => {
		const { countArr } = this.state;
		for (let item of countArr) {
			if (sourceId === item.id) {
				return item.count;
			}
		}
		return 0;
	};

	/**
	 * 任务解析状态
	 * @param {IFAnalysisSourceDetailInfo} itemInfo IFAnalysisSourceDetailInfo
	 * @returns {void}
	 * @memberof UploadRecord
	 */
	_statusColorSetting = (itemInfo: IFAnalysisSourceDetailInfo) => {
		if (itemInfo.status === EAnalysisSourceStatus.RealTimeAnalysis) {
			return <span style={{ color: '#00EAFF' }}>{itemInfo.statusTip}</span>;
		}

		if (itemInfo.status === EAnalysisSourceStatus.Analysising) {
			return <span style={{ color: '#0278FF' }}>{itemInfo.statusTip}</span>;
		}

		if (isAnalysisSourceProcessing(itemInfo.status)) {
			return <span style={{ color: '#0278FF' }}>{itemInfo.statusTip}</span>;
		}

		if (isAnalysisSourceWaiting(itemInfo.status)) {
			return <span style={{ color: '#00EAFF' }}>{itemInfo.statusTip}</span>;
		}

		if (isAnalysisSourceFinished(itemInfo.status)) {
			return <span style={{ color: '#21CB70' }}>{itemInfo.statusTip}</span>;
		}

		return <span>{itemInfo.statusTip}</span>;
	};

	//搜索
	onChangeSearchStr = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		this.setState({ searchStr: value }, () => {
			clearTimeout(timer); // 清除未执行的代码，重置回初始化状态
			timer = setTimeout(() => {
				this.getUploadRecordData();
			}, 300);
		});
	};

	//改变日期
	onChangeDate = (date: RangePickerPresetRange, dateString: Array<string>) => {
		this.setState(
			{
				startDate: dateString[0] ? dateString[0] + ` 00:00:00` : '',
				endDate: dateString[1] ? dateString[1] + ` 23:59:59` : ''
			},

			this.getUploadRecordData
		);
	};

	// /**
	//  * 删除某条记录
	//  * @param {string} id 记录id
	//  * @returns {void}
	//  * @memberof UploadRecord
	//  */
	// handleDelete = (id: string) => {
	// 	const { dataList } = this.state;
	// 	this.deleteUploadRecord(id)
	// 		.then((res) => {
	// 			if (res) {
	// 				message.success('删除成功！');
	// 				this.setState({
	// 					dataList: dataList.filter((item) => item.id !== id)
	// 				});

	// 				eventEmiiter.emit(
	// 					EventType.deleteAnalysisingSource,
	// 					id,
	// 					UploadRecord.ownName()
	// 				);
	// 			} else {
	// 				message.error('删除失败！');
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 			message.error(error.message);
	// 		});
	// };

	/**
	 * 返回选中上传记录ids
	 * @memberof UploadRecord
	 * @returns {string[]} 返回选中上传记录ids
	 */
	_getRecordIds = (): string[] => {
		const { selectedlist } = this.state;
		const ids: string[] = [];
		for (let item of selectedlist) {
			ids.push(item.id);
		}
		return ids;
	};

	/**
	 * 删除上传记录请求
	 * @param {string} ids 任务id
	 * @returns {Promise<boolean>} 是否成功
	 * @memberof UploadRecord
	 */
	async deleteUploadRecord(ids: string): Promise<boolean> {
		let result: boolean = false;
		result = await CollectionAnalysisSourceRequest.deleteAnalysisSource(ids);
		return result;
	}

	/**
	 * s批量删除确认框
	 * @returns {void}
	 */
	handleShowConfirmedModal = (): void => {
		let self = this;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onCancel: function onCancel() {
				handle.destory();
			},
			onOk: function onOk() {
				self.handleBatchDelete();
				setTimeout(() => {
					handle.destory();
				}, 100);
			},
			onChange: none,
			confirmTitle: intl.get('SURE_TO_DELETE').d('确定删除所选记录？')
		});
	};

	/**
	 * 批量删除
	 * @memberof UploadRecord
	 * @returns {void}
	 */
	handleBatchDelete = () => {
		const ids = this._getRecordIds().join(); //[1,2,2,2,2] =>"1,2,2,2,2"

		this.deleteUploadRecord(ids)
			.then((res) => {
				if (res) {
					this._Render();
					this.setState({
						showconfirmedModal: false
					});
					this.getUploadRecordData();
					message.success('删除成功！');

					// 发送事件
					eventEmiiter.emit(
						EventType.deleteAnalysisingSource,
						ids,
						UploadRecord.ownName()
					);
				} else {
					message.error('删除失败！');
				}
			})
			.catch((error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//渲染数据
	_Render = () => {
		const dataList = [...this.state.dataList];
		let list: Array<IFAnalysisSourceDetailInfo> = [];
		list = dataList.filter((item) => {
			return !this._isSelected(item);
		});
		this.setState({
			selectedlist: [],
			dataList: list
		});
	};

	//判断某条记录是否选中
	_isSelected = (item: IFAnalysisSourceDetailInfo) => {
		const { selectedlist } = this.state;
		for (let delectedItem of selectedlist) {
			if (item && item.id && item.id === delectedItem.id) {
				return true;
			}
		}
		return false;
	};
	//选中
	onSelectedChange = (
		record: IFAnalysisSourceDetailInfo,
		selected: boolean,
		selectedRows: Array<IFAnalysisSourceDetailInfo>
	) => {
		this.setState({
			selectedlist: [...selectedRows]
		});
	};
	handleVisibleChange = (visible: boolean) => {
		this.setState({ visible });
	};
	hideModle = () => {
		this.setState({
			visible: false
		});
	};
	handleOk = () => {
		const { dataList, recordId } = this.state;
		this.setState({
			confirmLoading: true
		});
		this.deleteUploadRecord(recordId)
			.then((res) => {
				if (res) {
					this.setState({
						dataList: dataList.filter((item) => item.id !== recordId)
					});
					this.getUploadRecordData();

					eventEmiiter.emit(
						EventType.deleteAnalysisingSource,
						recordId,
						UploadRecord.ownName()
					);
					message.success('删除成功！');
				} else {
					message.error('删除失败！');
				}
				this.setState({
					confirmLoading: false,
					visible: false
				});
			})
			.catch((error) => {
				console.error(error);
				message.error(error.message);
			});
	};
	showDeleteModle = (recordId: string) => {
		this.setState({
			visible: true,
			recordId
		});
	};
	//全选
	onSelectedAll = (
		selected: boolean,
		selectedRows: Array<IFAnalysisSourceDetailInfo>
	) => {
		if (selected) {
			this.setState({
				selectedlist: [...selectedRows]
			});
		} else {
			this.setState({
				selectedlist: []
			});
		}
	};

	/**
	 * 跳转查看单挑记录
	 * @param {IFAnalysisSourceDetailInfo} itemInfo itemInfo
	 * @returns {void}
	 */
	handleViewRecord = (itemInfo: IFAnalysisSourceDetailInfo) => {
		//跳转路径,将上传的图片和检索范围传递出去
		let pathname = this.props.match.url.replace('/usercenter', '');
		let locationProps: H.LocationDescriptorObject = {
			pathname: `${pathname}/search/result`
			// state: {
			// sourceList: [Object.getPrototypeOf(itemInfo)]
			// }
		};
		let originalRecordInfo = [itemInfo]; // [Object.getPrototypeOf(itemInfo)];
		saveSearchRangeMemo(originalRecordInfo);

		// NOTE: 重置状态(用login事件)
		eventEmiiter.emit(EventType.logIn);

		this.props.history.push(locationProps);
	};

	render() {
		const {
			dataList,
			searchStr,
			// tableHeight,
			selectedlist,
			startDate,
			endDate,
			loading,
			page,
			pageSize,
			total
		} = this.state;

		const columns: Array<ColumnProps<IFAnalysisSourceDetailInfo>> = [
			{
				title: '文件类型/名',
				dataIndex: 'sourceName',
				key: 'sourceName',
				width: 200,
				render: (text: string) => {
					return (
						<div title={text} className={ModuleStyle['source-name']}>
							{text}
						</div>
					);
				}
			},
			{
				title: '状态',
				// dataIndex: 'status',
				key: 'status',
				width: 120,
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) =>
					this._statusColorSetting(itemInfo)
			},
			{
				title: '大小',
				// dataIndex: 'size',
				key: 'size',
				width: 150,
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return StringTool.getFileSizeTip(itemInfo.sourceSize);
				}
			},
			{
				title: intl.get('DATA_ANALYSIS_TARGETS').d('解析类型'),
				width: '12%',
				key: 'type',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					let tasks: IFAnalysisTaskInfo[] = itemInfo.analyzeTasks;
					let set = new Set();
					for (let task of tasks) {
						for (let target of task.analyzeType) {
							set.add(target);
						}
					}
					let targets: ETargetType[] = Array.from(set);
					let tips: string[] = [];
					for (let target of targets) {
						switch (target) {
							case ETargetType.Face:
								tips.push(intl.get('ANALYSIS_INFO_TARGET_FACE').d('人脸'));
								break;
							case ETargetType.Body:
								tips.push(intl.get('ANALYSIS_INFO_TARGET_BODY').d('人体'));
								break;
							case ETargetType.Vehicle:
								tips.push(intl.get('ANALYSIS_INFO_TARGET_CAR').d('车辆'));
								break;
							default:
								tips.push(intl.get('COMMON_UNKNOWN').d('未知'));
								break;
						}
					}
					return tips.join(',');
				}
			},
			{
				title: '解析总数 （张）',
				// dataIndex: 'counts',
				key: 'counts',
				width: 150,
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return this._getRecordCount(itemInfo.sourceId);
				}
			},
			{
				title: '时间',
				// dataIndex: 'time',
				key: '5',
				width: 150,
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return moment(itemInfo.createTime).format('YYYY-MM-DD HH:mm:ss');
				}
			},
			// {
			// 	title: '上传账号',
			// 	// dataIndex: 'account',
			// 	key: '6',
			// 	width: 150,
			// 	render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
			// 		if (itemInfo.operateUsers && itemInfo.operateUsers.length > 0) {
			// 			return itemInfo.operateUsers[0].account;
			// 		} else {
			// 			return '---';
			// 		}
			// 	}
			// },
			// {
			// 	title: '上传姓名',
			// 	// dataIndex: 'uploader',
			// 	key: '7',
			// 	width: 150,
			// 	render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
			// 		if (itemInfo.operateUsers && itemInfo.operateUsers.length > 0) {
			// 			return itemInfo.operateUsers[0].name;
			// 		} else {
			// 			return '---';
			// 		}
			// 	}
			// },
			{
				title: '操作',
				key: 'operation',
				width: 200,
				render: (
					text: IFAnalysisSourceDetailInfo,
					record: IFAnalysisSourceDetailInfo
				) =>
					this.state.dataList.length >= 1 ? (
						<span>
							<Button
								ghost
								type={'danger'}
								className={`${ModuleStyle['content-delete']}`}
								onClick={this.showDeleteModle.bind(this, record.id)}
							>
								{intl.get('USER_DELETE').d('删除')}
							</Button>
							<Button
								ghost
								type={'primary'}
								className={`${ModuleStyle['content-check']}`}
								onClick={this.handleViewRecord.bind(this, record)}
							>
								{intl.get('USER_VIEW').d('查看')}
							</Button>
						</span>
					) : null
			}
		];

		// 计算批量删除按钮是否可用
		let isDisabled = true;
		if (selectedlist.length > 0) {
			isDisabled = false;
		}

		return (
			<div className={`${ModuleStyle['upload-record-wrap']}`}>
				<div className={`${ModuleStyle['content-title']}`}>
					<span>{intl.get('USER_UPLOAD_RECORD').d('上传记录')}</span>
				</div>
				<div className={`${ModuleStyle['content-filter']}`}>
					<Button
						type="primary"
						disabled={isDisabled}
						style={{
							marginLeft: 24,
							marginRight: 40,
							color: 'rgba(255, 255, 255, 1)'
						}}
						onClick={this.handleShowConfirmedModal}
					>
						{intl.get('USER_BATCH_DELETE').d('批量删除')}
					</Button>
					{/* </Popconfirm> */}
					<span style={{ marginRight: 15, color: '#8395A7' }}>
						{intl.get('USER_ACCESS_TIME').d('接入时间')}:
					</span>
					<RangePicker
						defaultValue={[
							moment(startDate, 'YYYY-MM-DD HH:mm:ss'),
							moment(endDate, 'YYYY-MM-DD HH:mm:ss')
						]}
						className={`${ModuleStyle['content-date']}`}
						onChange={this.onChangeDate}
					/>
					<Input
						className={`${ModuleStyle['search-input']}`}
						placeholder={intl.get('FILE_NAME').d('文件名')}
						prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
						value={searchStr}
						onChange={this.onChangeSearchStr}
					/>
				</div>
				<div className={`${ModuleStyle['content-table-container']}`}>
					<Table
						className={`${ModuleStyle['content-table']}`}
						loading={loading}
						pagination={false}
						// scroll={{ y: 540 }}
						// scroll={{ y: tableHeight }}
						rowSelection={{
							onSelect: this.onSelectedChange,
							onSelectAll: this.onSelectedAll
						}}
						locale={{
							emptyText: (
								<Empty
									description={<span>{intl.get('NO_DATA').d('暂无数据')}</span>}
								/>
							)
						}}
						columns={columns}
						dataSource={dataList}
						rowKey="id"
						// onChange={this.handleTableChange}
					/>
					<Pagination
						className={ModuleStyle['upload-pagination']}
						onChange={this.handleChangePage}
						total={total}
						pageSize={pageSize}
						current={page}
						hideOnSinglePage={total === 0}
					/>
				</div>
				{/* <div className={ModuleStyle['upload-pagination-container']}>
					<Pagination
						className={ModuleStyle['upload-pagination']}
						onChange={this.handleChangePage}
						total={total}
						pageSize={pageSize}
						current={page}
						hideOnSinglePage={total === 0}
					/>
				</div> */}
				<Modal
					visible={this.state.visible}
					onOk={this.handleOk}
					onCancel={this.hideModle}
					confirmLoading={this.state.confirmLoading}
					okText={intl.get('SURE_BTN').d('确定')}
					cancelText={intl.get('CANCLE_BTN').d('取消')}
					className={ModuleStyle['delete-upload-file-record']}
				>
					<div className={ModuleStyle['delete-file-record-content']}>
						<span className={ModuleStyle['delete-file-record-label']}>
							<Icon type="warning" style={{ color: 'red' }} />
						</span>
						<span>{intl.get('SURE_TO_DELETE').d('确定删除？')}</span>
					</div>
				</Modal>
			</div>
		);
	}
}

//@ts-ignore
export default withRouter(UploadRecord);
