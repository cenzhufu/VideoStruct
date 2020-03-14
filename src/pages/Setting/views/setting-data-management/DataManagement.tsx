import * as React from 'react';
import * as intl from 'react-intl-universal';
import DataModuleStyle from './assets/styles/index.module.scss';
import {
	Input,
	Icon,
	Button,
	Table,
	DatePicker,
	Cascader,
	message,
	Pagination,
	Empty
} from 'antd';
import { ColumnProps, TableRowSelection } from 'antd/lib/table';
import {
	IFOrganizationTree,
	ListType,
	ESourceType,
	ETargetType
} from 'stsrc/type-define';
import { OrganizationRequests } from 'stsrc/utils/requests/user-auth-requests';
import {
	CollectionAnalysisSourceRequest,
	IFAnalysisDataSourceListReqPayload,
	IFAnalysisSourceDetailInfo,
	EAnalysisSourceStatus,
	IFAnalysisResourceResPayload,
	TaskUserType,
	IFAnalysisTaskInfo,
	isAnalysisSourceProcessing,
	isAnalysisSourceWaiting,
	isAnalysisSourceFinished
} from 'stsrc/utils/requests/collection-request';
import * as moment from 'moment';
import StringTool from 'stsrc/utils/foundations/string';
import * as H from 'history';
import { match } from 'react-router-dom';
import DeleteConfirmModal from 'stsrc/components/delete-confirm-modal';
import {
	startTimeFormat,
	endTimeFormat
} from '../setting-record-management/RecordSearch';
import {
	DataServerRequests,
	IStatisticItemInfo
} from 'stsrc/utils/requests/data-server-requests';
import STComponent from 'stcomponents/st-component';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { saveSearchRangeMemo } from 'stsrc/pages/Search/views/search-result-page';
import { withUserInfo, UserInfoContextType } from 'stcontexts';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
import { IFUploadAndAnalysisProcessInfo } from 'stsrc/components/file-upload-analysis-panel';
import { CascaderOptionType } from 'antd/lib/cascader';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
const { RangePicker } = DatePicker;

interface PropsType extends UserInfoContextType {
	match: match;
	history: H.History;
	location: H.Location;
}
interface Counts {
	id: string;
	count: number;
}
interface StateTpye {
	dataSource: Array<IFAnalysisSourceDetailInfo>;
	organizationTreeList: Array<IFOrganizationTree>;
	counts: Counts[];
	dataTotalNumber: number;
	page: number;
	pageSize: number;
	orgId: string;
	startTime: string;
	endTime: string;
	searchStr: string;
	deleteBatch: string;
	deleteBatchButton: boolean;
}

class DataManagement extends STComponent<PropsType, StateTpye> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			dataSource: [],
			organizationTreeList: [],
			dataTotalNumber: 0,
			page: 1,
			pageSize: 10,
			orgId: '',
			startTime: String(
				this.formatTimeStamp(
					moment()
						.set('hour', 0)
						.set('minute', 0)
						.set('second', 0)
						.subtract('90', 'days')
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			endTime: String(
				this.formatTimeStamp(
					moment()
						.set('hour', 23)
						.set('minute', 59)
						.set('second', 59)
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			searchStr: '',
			counts: [],
			deleteBatch: '',
			deleteBatchButton: true
		};
	}

	static ownName(): string {
		return 'data-mananger';
	}

	componentDidMount() {
		this.inquireOrganization();
		this.refreshSourceData();

		// 删除正在解析的数据源
		eventEmiiter.addListener(
			EventType.deleteAnalysisingSource,
			this.onDeleteAnalysisingInfo
		);

		// 新增数据源
		eventEmiiter.addListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);
	}

	componentWillUnmount() {
		// 删除正在解析的数据源
		eventEmiiter.removeListener(
			EventType.deleteAnalysisingSource,
			this.onDeleteAnalysisingInfo
		);

		eventEmiiter.removeListener(
			EventType.addNewAnalysisSource,
			this.addNewAnalysisSource
		);
	}

	addNewAnalysisSource = () => {
		this.refreshSourceData();
	};

	onDeleteAnalysisingInfo = (
		info: IFAnalysisSourceDetailInfo | IFUploadAndAnalysisProcessInfo,
		from: string
	) => {
		if (from !== DataManagement.ownName()) {
			this.refreshSourceData();
		}
	};

	inquireOrganization = (): void => {
		OrganizationRequests.inquireOrganizationsByNode()
			.then((list: Array<IFOrganizationTree>) => {
				if (list && list[0]) {
					let children = ValidateTool.getValidArray(list[0]['children']);
					this.setState({ organizationTreeList: children });
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//获取采集服务数据列表
	inquireAnalysisSourceList = (
		page: number,
		pageSize: number,
		orgId?: string,
		startTime?: string,
		endTime?: string,
		searchStr?: string
	) => {
		const payload: IFAnalysisDataSourceListReqPayload = {
			page: page,
			pageSize: pageSize,
			orgId: orgId,
			startTime: startTime,
			endTime: endTime,
			sourceTypes: [ESourceType.Zip, ESourceType.Video],
			query: searchStr,
			resourceStatus: 0 // 0表示不是删除状态
		};
		CollectionAnalysisSourceRequest.getAnalysisSourceList(payload)
			.then((collecttionSource: ListType<IFAnalysisSourceDetailInfo>) => {
				this.setState({
					dataSource: collecttionSource.list,
					dataTotalNumber: collecttionSource.total
				});
				this.getTotalCount();
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//刷新数据源操作
	refreshSourceData = () => {
		this.inquireAnalysisSourceList(
			this.state.page,
			this.state.pageSize,
			this.state.orgId,
			this.state.startTime,
			this.state.endTime,
			this.state.searchStr
		);
	};

	// 删除采集服务数据源
	deleteAnalysisSourceData = (ids: string) => {
		CollectionAnalysisSourceRequest.deleteAnalysisSource(ids)
			.then((delSuccess: boolean) => {
				if (delSuccess) {
					message.success(intl.get('DATA_DELETE_SUCCESS').d('数据源删除成功'));
					this.refreshSourceData();

					// 发送事件
					eventEmiiter.emit(
						EventType.deleteAnalysisingSource,
						ids,
						DataManagement.ownName()
					);
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//获取人体和人脸的总的统计数量
	inquireTotalAnalysisNumber = (
		sourceIds: string,
		sourceTypes: ESourceType
	) => {
		let payload: IFAnalysisResourceResPayload = {
			sources: [
				{
					sourceId: sourceIds,
					sourceType: sourceTypes
				}
			]
			// sourceIds: [sourceIds],
			// sourceTypes: [sourceTypes]
		};
		DataServerRequests.getTotalAnalysisStaticResult(payload)
			.then((data: Array<IStatisticItemInfo>) => {
				if (data && data.length > 0) {
					let list: Counts[] = [
						{
							id: sourceIds,
							count: data[0].statisticalResult
						}
					];

					this.setState({
						counts: [...this.state.counts, ...list]
					});
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//调用人体和人脸的总的统计数量接口
	getTotalCount = () => {
		const dataSource = this.state.dataSource;
		for (let item of dataSource) {
			this.inquireTotalAnalysisNumber(item.sourceId, item.sourceType);
		}
	};

	//获取conts
	dataTableCounts = (sourceId: string) => {
		const { counts } = this.state;

		for (let item of counts) {
			if (item.id === sourceId) return item.count;
		}
		return 0;
	};

	//查看采集服务器数据源
	viewAnalysisSourceData = (itemInfo: IFAnalysisSourceDetailInfo) => {
		//跳转路径,将上传的图片和检索范围传递出去
		let pathname = this.props.match.url.replace('/setting/data', '');
		let locationProps: H.LocationDescriptorObject = {
			pathname: `${pathname}/search/result`
		};
		let originalRecordInfo = [itemInfo]; // [Object.getPrototypeOf(itemInfo)];
		saveSearchRangeMemo(originalRecordInfo);

		// NOTE: 重置状态(用login事件)
		eventEmiiter.emit(EventType.logIn);

		this.props.history.push(locationProps);
	};

	onChangeSearchStr = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		this.setState({ searchStr: value });
		if (value === '' || value === null) {
			this.inquireAnalysisSourceList(
				this.state.page,
				this.state.pageSize,
				this.state.orgId,
				this.state.startTime,
				this.state.endTime,
				value
			);
		}
	};

	searchStrOnPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		this.inquireAnalysisSourceList(
			this.state.page,
			this.state.pageSize,
			this.state.orgId,
			this.state.startTime,
			this.state.endTime,
			value
		);
	};

	//批量删除 NOTE:暂定不显示批量删除CheckBox
	deleteBatchConfirm = () => {
		let ids: string = this.state.deleteBatch;
		let self = this;
		// let checked: boolean = false;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onChange: function(e: CheckboxChangeEvent) {
				// checked = e.target.checked;
			},
			onOk: function onOk() {
				handle.destory();
				self.deleteAnalysisSourceData(ids);
			},
			onCancel: function onCancel() {
				handle.destory();
			}
		});
		this.setState({ deleteBatchButton: true });
	};

	deleteBatchCancel = () => {
		this.setState({ deleteBatch: '', deleteBatchButton: true });
	};

	//默认获取当前时间前十天数据（包括今天)
	dateSelectedChange = (dates: any, timeString: Array<string>) => {
		this.setState({
			startTime: startTimeFormat(timeString[0]),
			endTime: endTimeFormat(timeString[1])
		});
		this.inquireAnalysisSourceList(
			this.state.page,
			this.state.pageSize,
			this.state.orgId,
			startTimeFormat(timeString[0]),
			endTimeFormat(timeString[1]),
			this.state.searchStr
		);
	};

	//time转时间戳：new Date().getTime()
	formatTimeStamp = (time: string) => {
		return new Date(time).getTime();
	};

	inquierCacaaderId = (value: string[], orgType: Array<IFOrganizationTree>) => {
		if (value.length > 0) {
			return value[value.length - 1];
		} else {
			return '';
		}
	};

	//设置cascader 组织id
	cascaderSeletedChange = (value: string[], selectedOptions: []) => {
		let id: string = this.inquierCacaaderId(value, selectedOptions);
		this.setState({ orgId: id });
		this.inquireAnalysisSourceList(
			this.state.page,
			this.state.pageSize,
			id,
			this.state.startTime,
			this.state.endTime,
			this.state.searchStr
		);
	};

	dataDeleteCancel = () => {};

	dataDeleteConfirm = (text: IFAnalysisSourceDetailInfo) => {
		let self = this;
		// let checked: boolean = false;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onChange: function(e: CheckboxChangeEvent) {
				// checked = e.target.checked;
			},
			onOk: function onOk() {
				handle.destory();
				self.deleteAnalysisSourceData(text.id);
			},
			onCancel: function onCancel() {
				handle.destory();
			}
		});
	};

	//分页设置
	dataPageChange = (page: number, pageSize: number) => {
		this.setState({
			page: page,
			pageSize: pageSize
		});
		this.inquireAnalysisSourceList(
			page,
			pageSize,
			this.state.orgId,
			this.state.startTime,
			this.state.endTime,
			this.state.searchStr
		);
	};

	//视频解析状态渲染设置
	statusColorSetting = (itemInfo: IFAnalysisSourceDetailInfo) => {
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

	//空值
	nullValueCheck = (args: any) => {
		return args || '---';
	};

	titleTextFormat = (title: string) => {
		let result = title ? title : '---';
		return (
			<span
				className={`${DataModuleStyle['data-management-table-file-type']}`}
				title={result}
			>
				{result}
			</span>
		);
	};

	canDeleteThisSource(sourceInfo: IFAnalysisSourceDetailInfo): boolean {
		if (this.props.userInfo) {
			if (this.props.userInfo.isSuperUser) {
				return true;
			}

			// 是否在taskUsers里边
			for (let taskUser of sourceInfo.operateUsers) {
				// eslint-disable-next-line
				if (taskUser.id == this.props.userInfo.id) {
					return true;
				}
			}
			return false;
		} else {
			return false;
		}
	}

	/**
	 * 批量处理用户账号信息，针对多个用户上传同一数据源，显示该数据源下所有用户账号信息
	 * @param {Array<TaskUserType>}  operateUsers 上传用户信息
	 * @memberof DataManagement
	 * @returns {void}
	 */
	operateUsersAccountHandle = (operateUsers: Array<TaskUserType>) => {
		let usersAccountTotalInfo: Array<string> = [];
		if (operateUsers && operateUsers.length > 0) {
			for (let item of operateUsers) {
				usersAccountTotalInfo.push(item.account);
			}
		}
		let showAccoutInfo: string = usersAccountTotalInfo.join();
		if (showAccoutInfo && showAccoutInfo.length > 0) {
			return showAccoutInfo;
		} else {
			return '---';
		}
	};

	/**
	 * 批量处理用户单位信息，针对多个用户上传同一数据源，显示该数据源下所有用户单位信息
	 * @param {Array<TaskUserType>}  operateUsers 上传用户信息
	 * @memberof DataManagement
	 * @returns {void}
	 */
	operateUsersOrgHandle = (operateUsers: Array<TaskUserType>) => {
		let usersOrgTotalInfo: Array<string> = [];
		if (operateUsers && operateUsers.length > 0) {
			for (let item of operateUsers) {
				usersOrgTotalInfo.push(item.organization);
			}
		}
		let showOrgInfo: string = usersOrgTotalInfo.join();
		if (showOrgInfo && showOrgInfo.length > 0) {
			return showOrgInfo;
		} else {
			return '---';
		}
	};

	changeAreaToCascadeOption(area: IFOrganizationTree): CascaderOptionType {
		let result = {
			value: area.id,
			label: area.name
		};

		if (area.children.length > 0) {
			result['children'] = area.children.map((child: IFOrganizationTree) => {
				return this.changeAreaToCascadeOption(child);
			});
		}

		return result;
	}

	render() {
		const {
			searchStr,
			dataSource,
			dataTotalNumber,
			page,
			deleteBatchButton,
			pageSize
		} = this.state;

		const rowSelection: TableRowSelection<IFAnalysisSourceDetailInfo> = {
			onChange: (
				selectedRowKeys: Array<string>,
				selectedRows: Array<Object>
			) => {
				let ids: string = selectedRowKeys.join();
				if (ids === '') {
					this.setState({ deleteBatchButton: true });
				} else {
					this.setState({
						deleteBatchButton: false,
						deleteBatch: ids
					});
				}
			},

			getCheckboxProps: (info: IFAnalysisSourceDetailInfo) => {
				return {
					disabled: !this.canDeleteThisSource(info)
				};
			}
		};

		const columns: Array<ColumnProps<IFAnalysisSourceDetailInfo>> = [
			{
				title: intl.get('DATA_SOURCE_TYPE').d('文件类型/名'),
				width: '8%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) =>
					this.titleTextFormat(itemInfo.sourceName)
			},
			{
				title: intl.get('DATA_STATUS_TYPE').d('状态'),
				width: '8%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) =>
					this.statusColorSetting(itemInfo)
			},
			{
				title: intl.get('DATA_FILE_SIZE').d('大小'),
				dataIndex: 'sourceSize',
				width: '8%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return StringTool.getFileSizeTip(itemInfo.sourceSize);
				}
			},
			{
				title: intl.get('DATA_ANALYSIS_TARGETS').d('解析类型'),
				width: '12%',
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
				title: intl.get('DATA_ANALYSIS_COUNTS').d('解析总数 （张）'),
				key: 'itemInfo.sourceId',
				width: '10%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return this.dataTableCounts(itemInfo.sourceId);
				}
			},
			{
				title: intl.get('DATA_UPLOAD_TIME').d('时间'),
				dataIndex: 'createTime',
				width: '15%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return moment(itemInfo.createTime).format('YYYY-MM-DD HH:mm:ss');
				}
			},
			{
				title: intl.get('DATA_UPLOAD_ACCOUNT').d('上传账号'),
				key: 'account',
				width: '8%',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return this.operateUsersAccountHandle(itemInfo.operateUsers);
				}
			},
			{
				title: intl.get('DATA_UPLOAD_ORGANIZATION').d('上传单位'),
				key: 'organization',
				render: (text: string, itemInfo: IFAnalysisSourceDetailInfo) => {
					return this.operateUsersOrgHandle(itemInfo.operateUsers);
				}
			},
			{
				title: intl.get('OPERATION').d('操作'),
				align: 'center',
				key: 'operator',
				width: '15%',
				render: (text: string, record: IFAnalysisSourceDetailInfo) => (
					<span className={`${DataModuleStyle['account-data-operation']}`}>
						{this.canDeleteThisSource(record) && (
							<Button
								type={'danger'}
								ghost
								onClick={this.dataDeleteConfirm.bind(this, text)}
							>
								<span
									className={`${DataModuleStyle['data-management-delete']}`}
								>
									{intl.get('ACCOUNT_DATA_DELETE').d('删除')}
								</span>
							</Button>
						)}
						<Button
							type={'primary'}
							onClick={this.viewAnalysisSourceData.bind(this, record)}
						>
							<span className={`${DataModuleStyle['data-management-view']}`}>
								{intl.get('ACCOUNT_DATA_CHECK').d('查看')}
							</span>
						</Button>
					</span>
				)
			}
		];
		return (
			<div className={`${DataModuleStyle['data-management-all']}`}>
				<div className={`${DataModuleStyle['data-management-block']}`}>
					<span className={`${DataModuleStyle['data-management-title']}`}>
						{intl.get('DATA_MANAGEMENT').d('数据管理')}
					</span>
				</div>

				<div className={`${DataModuleStyle['data-filter']}`}>
					<Button
						className={`${DataModuleStyle['data-filter-add-button']}`}
						disabled={deleteBatchButton}
						type={'primary'}
						onClick={this.deleteBatchConfirm}
					>
						{intl.get('DATA_BATCH_DELETE').d('批量删除')}
					</Button>

					<span className={`${DataModuleStyle['data-choose-title']}`}>
						{intl.get('UNITIES_SELECT').d('单位选择:')}
					</span>
					{/* 单位级联显示 */}
					<Cascader
						className={`${DataModuleStyle['data-choose-menus']}`}
						options={this.state.organizationTreeList.map(
							(organization: IFOrganizationTree) => {
								return this.changeAreaToCascadeOption(organization);
							}
						)}
						expandTrigger={'hover'}
						placeholder={intl.get('UNITS_OPTION_SELECT_UNIT').d('请选择单位')}
						onChange={this.cascaderSeletedChange}
						changeOnSelect
					/>

					{/* 接入选择时间 */}
					<span className={`${DataModuleStyle['data-choose-title']}`}>
						{intl.get('DATA_ACCESS_TIME').d('接入时间:')}
					</span>
					<RangePicker
						className={`${DataModuleStyle['data-content-date']}`}
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
						onChange={this.dateSelectedChange}
						allowClear={false}
					/>
					<Input
						className={`${DataModuleStyle['data-search-area']}`}
						placeholder={intl.get('DATA_SOURCE_TYPE').d('文件类型/名')}
						prefix={<Icon type="search" theme={'outlined'} />}
						value={searchStr}
						onChange={this.onChangeSearchStr}
						onPressEnter={this.searchStrOnPressEnter}
						style={{ width: '27.1vw', marginLeft: '5.6vw' }}
					/>
				</div>

				<div className={`${DataModuleStyle['data-table-content']}`}>
					<Table
						className={`${DataModuleStyle['data-table-show']}`}
						dataSource={dataSource}
						rowKey={'id'}
						rowSelection={rowSelection}
						columns={columns}
						pagination={false}
						locale={{
							emptyText: (
								<Empty
									description={<span>{intl.get('NO_DATA').d('暂无数据')}</span>}
								/>
							)
						}}
					/>
					<Pagination
						className={`${DataModuleStyle['data-table-pagination']}`}
						total={dataTotalNumber}
						current={page}
						pageSize={pageSize}
						onChange={this.dataPageChange}
						style={{ marginBottom: 20 }}
						hideOnSinglePage={dataTotalNumber === 0}
					/>
				</div>
			</div>
		);
	}
}

export default withUserInfo(DataManagement);
