import * as React from 'react';
import * as intl from 'react-intl-universal';
import RecordSearchModuleStyle from './assets/styles/index.module.scss';
import {
	Input,
	DatePicker,
	Icon,
	Select,
	Table,
	message,
	Pagination,
	Popover,
	Empty
} from 'antd';
import { ColumnProps } from 'antd/lib/table';
import * as moment from 'moment';
import {
	UserRecordSearchRequest,
	IRecordDataSourceListReqPayload,
	IFRecordInfo
} from 'stsrc/utils/requests/user-auth-requests/record';
import { ListType, IFUserInfo } from 'stsrc/type-define';
import STComponent from 'stcomponents/st-component';
const { RangePicker } = DatePicker;
const Option = Select.Option;

interface PropsType {}
interface StateTpye {
	dataSource: Array<IFRecordInfo>;
	searchStr: string;
	startTime: string;
	endTime: string;
	operationType: Array<number>;
	operationValue: string;
	total: number;
	page: number;
	pageSize: number;
}

class RecordSearch extends STComponent<PropsType, StateTpye> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			dataSource: [],
			searchStr: '',
			startTime: String(
				formatTimeStamp(
					moment()
						.set('hour', 0)
						.set('minute', 0)
						.set('second', 0)
						.subtract('90', 'days')
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			endTime: String(
				formatTimeStamp(
					moment()
						.set('hour', 23)
						.set('minute', 59)
						.set('second', 59)
						.format('YYYY-MM-DD HH:mm:ss')
				)
			),
			operationType: [0, 1, 1000, 1001, 1002, 2000],
			operationValue: '',
			total: 0,
			page: 1,
			pageSize: 10
		};
	}

	componentDidMount() {
		this.refreshDataSource();
	}

	//获取查询记录数据
	inquireSearchRecord = (
		page: number,
		pageSize: number,
		logType?: string,
		startTime?: string,
		endTime?: string,
		query?: string
	) => {
		let payload: IRecordDataSourceListReqPayload = {
			page: page,
			pageSize: pageSize,
			logType: logType,
			startTime: startTime,
			endTime: endTime,
			query: query
		};
		UserRecordSearchRequest.recordSearch(payload)
			.then((records: ListType<IFRecordInfo>) => {
				this.setState({
					dataSource: records.list,
					total: records.total
				});
			})
			.catch((error: Error) => {
				console.log(error);
				message.error(error.message);
			});
	};

	//刷新数据源
	async refreshDataSource() {
		return this.inquireSearchRecord(
			this.state.page,
			this.state.pageSize,
			this.state.operationValue,
			this.state.startTime,
			this.state.endTime,
			this.state.searchStr
		);
	}

	//操作类型选择
	operationTypeChange = (value: string, options: any) => {
		this.setState({ operationValue: value, page: 1 }, () => {
			this.inquireSearchRecord(
				this.state.page,
				this.state.pageSize,
				value,
				this.state.startTime,
				this.state.endTime,
				this.state.searchStr
			);
		});
	};

	//操作记录查询
	onChangeSearchStr = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		this.setState({ searchStr: value });
	};

	onPressEnterSearchStr = (e: React.KeyboardEvent<HTMLInputElement>) => {
		this.setState({ searchStr: e.currentTarget.value, page: 1 }, () => {
			this.inquireSearchRecord(
				this.state.page,
				this.state.pageSize,
				this.state.operationValue,
				this.state.startTime,
				this.state.endTime,
				this.state.searchStr
			);
		});
	};

	//日期过滤
	onChangeDate = (date: any, timeString: Array<string>) => {
		this.setState({
			startTime: startTimeFormat(timeString[0]),
			endTime: endTimeFormat(timeString[1])
		});
		this.inquireSearchRecord(
			this.state.page,
			this.state.pageSize,
			this.state.operationValue,
			startTimeFormat(timeString[0]),
			endTimeFormat(timeString[1]),
			this.state.searchStr
		);
	};

	//分页设置:TODO:过滤条件结果分页
	recordPageChange = (page: number, pageSize: number) => {
		this.setState({
			page: page,
			pageSize: pageSize
		});
		this.inquireSearchRecord(
			page,
			pageSize,
			this.state.operationValue,
			this.state.startTime,
			this.state.endTime,
			this.state.searchStr
		);
	};

	//操作类型设置
	operationTypeSetting = (logId: number) => {
		switch (logId) {
			case 0:
				return intl.get('RECORD_OPERATION_ALL').d('全部操作类型');
			case 1:
				return intl.get('RECORD_OPERATION_SEARCH').d('检索操作类型');
			case 1000:
				return intl.get('RECORD_OPERATION_LOGIN').d('登录/登出类型');
			case 1001:
				return intl.get('RECORD_OPERATION_ACCOUNT').d('账号操作类型');
			case 1002:
				return intl.get('RECORD_OPERATION_ORGANIZATION').d('单位操作类型');
			case 2000:
				return intl.get('RECORD_OPERATION_UPLOAD_ANALYSIS').d('上传/分析类型');
			default:
				return intl.get('RECORD_OPERATION_UNKNOWN').d('未知类型');
		}
	};

	//图片格式处理
	imageFormatHandle = (value: string) => {
		if (value) {
			let description = value.split('，')[0];
			let imageUrl: string = value.split('，')[1];
			const content = (
				<div className={`${RecordSearchModuleStyle['record-image-block']}`}>
					<img
						src={imageUrl}
						alt={imageUrl}
						className={`${RecordSearchModuleStyle['record-image']}`}
					/>
				</div>
			);
			return (
				<div>
					<span>{description}</span>
					<Popover content={content}>
						{this.nullStringCheck(
							imageUrl,
							intl.get('RECORD_OPERATION_IMAGE_URL').d('图片链接')
						)}
					</Popover>
				</div>
			);
		} else {
			return '---';
		}
	};

	nullStringCheck = (str: string, text: string) => {
		if (str === '' || str === null || str === undefined) {
			return '';
		} else {
			return (
				<span>
					{'，'}
					{<a>{text}</a>}
				</span>
			);
		}
	};

	//空值检测
	nullValueCheck = (args: any) => {
		return args || '---';
	};

	//对象检测
	objectValueCheck = (userInfo?: IFUserInfo, args: string = '') => {
		if (userInfo) {
			if (userInfo[args]) {
				return userInfo[args];
			} else {
				return '---';
			}
		} else {
			return '---';
		}
	};

	render() {
		const {
			dataSource,
			searchStr,
			operationType,
			total,
			page,
			pageSize
		} = this.state;

		const columns: Array<ColumnProps<IFRecordInfo>> = [
			{
				title: intl.get('USER').d('用户'),
				key: 'userInfo.account',
				width: '7%',
				render: (text: string, itemInfo: IFRecordInfo) =>
					this.objectValueCheck(itemInfo.userInfo, 'account')
			},
			{
				title: intl.get('NAME').d('姓名'),
				key: 'userInfo.name',
				width: '7%',
				render: (text: string, itemInfo: IFRecordInfo) =>
					this.objectValueCheck(itemInfo.userInfo, 'name')
			},
			{
				title: intl.get('ACCOUNT_PERMISSION').d('账号权限'),
				key: 'userInfo.',
				width: '7%',
				render: (text: string, itemInfo: IFRecordInfo) => {
					if (itemInfo.userInfo) {
						if (
							itemInfo.userInfo.roleList &&
							itemInfo.userInfo.roleList.length > 0
						) {
							return itemInfo.userInfo.roleList[0].roleName;
						} else {
							return '---';
						}
					} else {
						return '---';
					}
				}
			},
			{
				title: intl.get('TIME').d('时间'),
				dataIndex: 'operateTime',
				key: 'operateTime',
				width: '16%',
				render: (text: string, itemInfo: IFRecordInfo) =>
					this.nullValueCheck(itemInfo.operateTime)
			},
			{
				title: intl.get('OPERATION_TYPE').d('操作类型'),
				key: 'logType',
				width: '10%',
				render: (text: string, itemInfo: IFRecordInfo) =>
					this.operationTypeSetting(itemInfo.logType)
			},
			{
				title: intl.get('UNITS_DEPARTMENT').d('单位部门'),
				width: '10%',
				key: 'itemInfo.organization',
				render: (text: string, itemInfo: IFRecordInfo) =>
					this.objectValueCheck(itemInfo.userInfo, 'organization')
			},
			{
				title: intl.get('RECORD_OPERATION_DETAIL').d('操作详情'),
				width: '50%',
				key: 'itemInfo.description',
				render: (text: string, itemInfo: IFRecordInfo) => {
					return this.imageFormatHandle(itemInfo.description);
				}
			}
		];
		return (
			<div
				className={`${RecordSearchModuleStyle['record-search-management-all']}`}
			>
				<div
					className={`${
						RecordSearchModuleStyle['record-search-management-block']
					}`}
				>
					<span
						className={`${
							RecordSearchModuleStyle['record-search-management-title']
						}`}
					>
						{intl.get('RECORD_SEARCH').d('记录查询')}
					</span>
				</div>

				<div className={`${RecordSearchModuleStyle['record-search-filter']}`}>
					<Select
						className={`${RecordSearchModuleStyle['record-choose-menus']}`}
						// @NOTE: 没见过，没见过
						defaultValue={0}
						onChange={this.operationTypeChange}
					>
						{operationType.map((item) => {
							return (
								<Option value={item} key={String(item)}>
									{this.operationTypeSetting(item)}
								</Option>
							);
						})}
					</Select>
					<span className={`${RecordSearchModuleStyle['record-choose-title']}`}>
						{intl.get('RECORD_OPERATION_TIME').d('操作时间:')}
					</span>
					<RangePicker
						className={`${RecordSearchModuleStyle['record-content-date']}`}
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
						onChange={this.onChangeDate}
						allowClear={false}
					/>
					<div className={`${RecordSearchModuleStyle['record-search-area']}`}>
						<Input
							placeholder={
								intl.get('USER').d('用户') +
								'/' +
								intl.get('ACCOUNT_PERMISSION').d('账号权限') +
								'/' +
								intl.get('UNITS').d('单位') +
								'/' +
								intl.get('NAME').d('姓名')
							}
							prefix={<Icon type="search" theme={'outlined'} />}
							value={searchStr}
							onChange={this.onChangeSearchStr}
							onPressEnter={this.onPressEnterSearchStr}
						/>
					</div>

					<div />
				</div>
				<div className={`${RecordSearchModuleStyle['record-table-block']}`}>
					<Table
						className={`${RecordSearchModuleStyle['record-table-content']}`}
						dataSource={dataSource}
						rowKey={(item: IFRecordInfo) => {
							return item.id;
						}}
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
						className={`${RecordSearchModuleStyle['record-table-pagination']}`}
						onChange={this.recordPageChange}
						total={total}
						current={page}
						pageSize={pageSize}
						hideOnSinglePage={total === 0}
					/>
				</div>
			</div>
		);
	}
}

//时间格式化
export function startTimeFormat(time: string) {
	return String(
		formatTimeStamp(
			moment(time)
				.set('hour', 0)
				.set('minute', 0)
				.set('second', 0)
				.format('YYYY-MM-DD HH:mm:ss')
		)
	);
}

export function endTimeFormat(time: string) {
	return String(
		formatTimeStamp(
			moment(time)
				.set('hour', 23)
				.set('minute', 59)
				.set('second', 59)
				.format('YYYY-MM-DD HH:mm:ss')
		)
	);
}

function formatTimeStamp(time: string) {
	return new Date(time).getTime();
}
export default RecordSearch;
