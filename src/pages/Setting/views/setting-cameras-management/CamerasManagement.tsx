import * as React from 'react';
import {
	Button,
	Input,
	Modal,
	Table,
	Cascader,
	message,
	Pagination,
	Icon,
	Empty
} from 'antd';
import * as intl from 'react-intl-universal';
import {
	AreaRequests,
	DeviceRequests,
	IRGetDeviceListPayload,
	EDeviceWorkType
} from 'stsrc/utils/requests/basic-server-request';
import {
	IFAreaInfo,
	ESourceType,
	ListType,
	IFDeviceInfo,
	generateGeoPoint,
	ETargetType
} from 'sttypedefine';
import { ColumnProps } from 'antd/lib/table';
import StyleSheets from './assets/index.module.scss';
import DeleteConfirmModal from 'stsrc/components/delete-confirm-modal';
import STComponent from 'stcomponents/st-component';
import {
	CollectionAnalysisSourceRequest,
	IFAnalysisDataSourceListReqPayload,
	IFAnalysisSourceDetailInfo,
	UpdateAnalysisSourceReqPayloadType,
	EAnalysisSourceType,
	IFAnalysisTaskProfileInfo,
	CollectionTaskRequest,
	convertToSpecialTarget
} from 'stsrc/utils/requests/collection-request';
import CamerasForm from './submodules/cameras-management-form';
import { withUserInfo, UserInfoContextType } from 'stcontexts';
import Config from 'stsrc/utils/config';
import { CascaderOptionType } from 'antd/lib/cascader';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';

interface PropsType extends UserInfoContextType {}

interface StateType {
	cameraList: Array<IFDeviceInfo>;
	areaList: IFAreaInfo[];
	pageNo: number;
	pageSize: number;
	areaId: string;
	orderBy: 'updated desc';
	cameraSearch: string;
	modalVisible: boolean;
	cameraControlType: string;
	cameraControlTitle: string;
	currentDeviceInfo?: IFDeviceInfo;
	total: number;
}

class CamerasManagement extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			cameraList: [],
			areaList: [],
			pageNo: 1,
			pageSize: 10,
			areaId: '',
			cameraSearch: '',
			modalVisible: false,
			cameraControlType: 'add',
			cameraControlTitle: intl
				.get('CAMERAS_MANAGEMENT_FORM_ADDTITLE')
				.d('增加摄像头'),
			currentDeviceInfo: undefined,
			total: 0,
			orderBy: 'updated desc' //按更新时间降序排列
		};
	}

	componentDidMount() {
		this.inquireAreaTree();
		this.refreshCamerasData();

		eventEmiiter.addListener(
			EventType.changeToDeviceManageTab,
			this.inquireAreaTree
		);
	}

	componentWillUnmount() {
		eventEmiiter.removeListener(
			EventType.changeToDeviceManageTab,
			this.inquireAreaTree
		);
	}

	/**
	 * 限制area的层级
	 * @param {Array<IFAreaInfo>} areaList 原始数据
	 * @param {number} maxlevel 最大层级
	 * @returns {Array<IFOrganizationTree>}  格式化数据
	 */
	filterAreaTree = (
		areaList: IFAreaInfo[] = [],
		maxlevel = Config.getAreaLevels()
	) => {
		let areaDataList: Array<IFAreaInfo> = [];
		for (let area of areaList) {
			let tempArea = { ...area };
			if (area.level < maxlevel) {
				tempArea['children'] = this.filterAreaTree(area.children, maxlevel);
			} else {
				// 太多的层级不显示了
				tempArea['children'] = [];
			}

			areaDataList.push(tempArea);
		}
		return areaDataList;
	};

	//获取区域树
	inquireAreaTree = () => {
		AreaRequests.getAreaTree()
			.then((list: IFAreaInfo[]) => {
				if (list.length > 0) {
					this.setState({
						areaList: this.filterAreaTree(list)
					});
				} else {
					message.error(intl.get('empty-data').d('暂无数据'));
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//获取摄像头
	getCameraList = (
		areaId?: string,
		cameraSearch?: string,
		pageNo?: number,
		pageSize?: number
	) => {
		let requestData: IRGetDeviceListPayload = {
			pageNo: pageNo ? pageNo : this.state.pageNo,
			pageSize: pageSize ? pageSize : this.state.pageSize,
			orderBy: this.state.orderBy,
			applyCameraOffset: false
		};
		if (areaId) {
			requestData['areaId'] = areaId;
		}
		if (cameraSearch) {
			requestData['searchText'] = cameraSearch;
		}

		//获取摄像头
		DeviceRequests.getDeviceList(requestData)
			.then((result: ListType<IFDeviceInfo>) => {
				console.log('摄像头列表', result);
				this.setState({
					cameraList: result.list,
					total: result.total
				});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	refreshCamerasData = () => {
		this.getCameraList(
			this.state.areaId,
			this.state.cameraSearch,
			this.state.pageNo,
			this.state.pageSize
		);
	};

	addCameraTree = () => {
		console.log('添加摄像头');
		if (this.props.userInfo && this.props.userInfo.hasDataAceessAuthority) {
			if (!this.state.modalVisible) {
				this.setState({
					modalVisible: true,
					cameraControlType: 'add',
					currentDeviceInfo: undefined,
					cameraControlTitle: intl
						.get('CAMERAS_MANAGEMENT_FORM_ADDTITLE')
						.d('增加摄像头')
				});
			}
		} else {
			message.error(
				intl
					.get('COMMON_NO_LOGIN_OR_NO_PERMISSION')
					.d('当前用户未登录或没有接入权限')
			);
		}
	};

	//摄像头删除模块使用统一提示框
	deleteCameraConfirm = (currentDeviceInfo: IFDeviceInfo) => {
		let self = this;
		let handle = DeleteConfirmModal.show({
			showConfirmModal: true,
			showCheckbox: false,
			onOk: function onOk() {
				handle.destory();
				self.deleteCamera(currentDeviceInfo);
			},
			onCancel: function onCancel() {
				handle.destory();
			},
			onChange: function() {}
		});
	};

	//新增摄像头
	addCameraHandle = (
		values: Pick<IFDeviceInfo, Exclude<keyof IFDeviceInfo, 'id' | 'uuid'>>,
		targets: ETargetType[]
	) => {
		const longitude = Number(values.lng);
		const latitude = Number(values.lat);
		const geoString = generateGeoPoint(latitude, longitude);
		if (!geoString) {
			return;
		}

		let payload = {
			ip: values.ip || '',
			areaId: values.areaId,
			name: values.name,
			loginUser: values.loginUser,
			password: values.password,
			port: values.port,
			channel: values.channel,
			geoString,
			ability: '',
			captureType: values.captureType
		};

		if (values.captureType === EDeviceWorkType.RTSP) {
			payload['rtsp'] = values.rtsp;
		}

		DeviceRequests.addDevice(payload)
			.then((cameras: IFDeviceInfo) => {
				console.log('摄像头信息............', cameras);
				//TODO:1.分析任务类型暂时传所有值，待确认UI是否变动 2.新增数据源阻塞（失败）如何处理？
				//添加数据源和解析任务
				this.createAnalysisDataSourceAndTasks(
					cameras.id,
					cameras.name,
					targets
				);
				this.modalOnCancel('reload');
				this.refreshCamerasData();
				message.success(
					intl.get('CAMERAS_MANAGEMENT_ADD_SUCCESS').d('添加摄像头成功')
				);
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//编辑摄像头
	editCameraHandle = (values: IFDeviceInfo) => {
		DeviceRequests.modifyDeviceInfo(values.id, {
			ip: values.ip,
			areaId: String(values.areaId),
			name: values.name,
			loginUser: values.loginUser,
			password: values.password,
			port: String(values.port),
			channel: values.channel,
			geoString: generateGeoPoint(values.lat, values.lng) as string,
			captureType: values.captureType,
			rtsp: values.rtsp
		})
			.then((modified: IFDeviceInfo) => {
				console.log('修改摄像头信息.........', modified);
				// //NOTE:修改分析源数据接入,传参数据源id,数据任务关联主键，自动更新，TODO:编辑数据源阻塞如何处理？
				// this.inquireAnalysisSourceList(values.id, ESourceType.Camera).then(
				// 	(id: string) => {
				// 		if (!id) {
				// 			return;
				// 		}
				// 		// this.updateAnalysisDataSourceAndTasks(id, values.name);
				// 	}
				// );

				this.modalOnCancel('reload');
				this.refreshCamerasData();
				message.success(
					intl.get('CAMERAS_MANAGEMENT_EDIT_SUCCESS').d('修改摄像头成功')
				);
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	//删除摄像头设备
	deleteCamera = (currentDeviceInfo: IFDeviceInfo) => {
		console.log('删除项........', currentDeviceInfo);
		if (currentDeviceInfo.id) {
			DeviceRequests.deleteDevice(currentDeviceInfo.id)
				.then((deleted: boolean) => {
					message.success(
						intl.get('CAMERAS_MANAGEMENT_DELETE_SUCCESS').d('删除摄像头成功')
					);
					this.refreshCamerasData();

					//NOTE:同时删除数据源，传值数据源id，先查id，再删除
					this.inquireAnalysisSourceList(
						currentDeviceInfo.id,
						ESourceType.Camera
					)
						.then((id: string) => {
							if (!id) {
								return;
							}
							this.deleteAnalysisSourceData(id);
						})
						.catch((error: Error) => {
							console.error(error);
							message.error(error.message);
						});
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);
				});
		} else {
			message.error(intl.get('lost-id').d('数据缺失'));
		}
	};

	modifyCamera = (currentDeviceInfo: IFDeviceInfo) => {
		//修改摄像头设备
		if (!this.state.modalVisible) {
			this.setState({
				modalVisible: true,
				currentDeviceInfo: currentDeviceInfo,
				cameraControlType: 'edit',
				cameraControlTitle: intl
					.get('CAMERAS_MANAGEMENT_FORM_EDITTITLE')
					.d('修改摄像头')
			});
		}
	};

	areaSelectOnChange = (value: Array<string>) => {
		console.log('区域级联选择情况', value);
		let selectValue =
			value.length > 0 ? value[value.length - 1].split(',')[0] : '';
		this.setState({
			areaId: selectValue
		});
		this.getCameraList(selectValue, this.state.cameraSearch, 1);
		this.setState({
			pageNo: 1
		});
	};

	cameraSearchOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value: string = e.target.value;
		this.setState({
			cameraSearch: value
		});
		if (value === '' || value === null) {
			this.getCameraList(this.state.areaId, value, 1);
			this.setState({
				pageNo: 1
			});
		}
	};

	searchStrOnPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		this.getCameraList(this.state.areaId, value, 1);
		this.setState({
			pageNo: 1
		});
	};

	modalOnCancel = (reload?: string) => {
		console.log('模态框关闭-camera', reload);
		this.setState({ modalVisible: false });
		if (reload === 'reload') {
			this.getCameraList(this.state.areaId, this.state.cameraSearch, 1);
			this.setState({
				pageNo: 1
			});
		}
	};

	camerasPageChange = (page: number, pageSize: number) => {
		this.setState({
			pageNo: page,
			pageSize: pageSize
		});
		this.getCameraList(
			this.state.areaId,
			this.state.cameraSearch,
			page,
			pageSize
		);
	};

	/**
	 * 数据源和数据任务创建
	 * @param {string} sourceId    				数据源ID
	 * @param {string} sourceName 				名称
	 * @param {Array<ETargetType>} tasks  任务类型
	 * @memberof CamerasForm
	 * @returns {void}
	 */
	createAnalysisDataSourceAndTasks = (
		sourceId: string,
		sourceName: string,
		tasks: ETargetType[]
	): void => {
		// let payload: CreateAnalysisSourceReqPayloadType = {
		// 	sourceId: sourceId,
		// 	sourceUrl: sourceUrl,
		// 	sourceType: sourceType,
		// 	sourceName: sourceName,
		// 	sourceSize: sourceSize
		// };

		let convertedTypes: string = tasks
			.map((target: ETargetType) => {
				return convertToSpecialTarget(target);
			})
			.filter((item: string) => {
				return !!item;
			})
			.join(',');

		CollectionAnalysisSourceRequest.createAnalysissTask({
			channelName: sourceName,
			sourceType: EAnalysisSourceType.NVRCamera,
			nvrParam: {
				cameraId: sourceId,
				cameraType: 'hikCamera'
			},
			transType: 0,
			imageUploadJson: {
				targetType: convertedTypes
			}
		})
			.then((res: IFAnalysisTaskProfileInfo) => {
				console.log('创建解析任务成功');

				CollectionTaskRequest.startAnalysisTask(res.id)
					.then(() => {
						console.log('开始任务成功');
					})
					.catch((error: Error) => {
						message.error(error.message);
						console.error(error);
					});
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 数据源和数据任务更新
	 * @param {string} id    			      	数据源ID
	 * @param {string} sourceName 				名称
	 * @param {Array<ETargetType>} tasks  任务类型
	 * @memberof CamerasForm
	 * @returns {void}
	 */
	updateAnalysisDataSourceAndTasks = (id: string, sourceName: string): void => {
		let payload: UpdateAnalysisSourceReqPayloadType = {
			id: id,
			sourceName: sourceName
		};
		CollectionAnalysisSourceRequest.updateAnalysisSource(payload)
			.then((itemSourceInfo: IFAnalysisSourceDetailInfo) => {
				console.log('=========更新数据源成功=========');
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 根据sourceID和sourcetype查询数据源id
	 * @param {string[]} sourceId        数据源
	 * @param {ESourceType[]} sourceType 类型
	 * @memberof CamerasManagement
	 * @returns {string} 								 返回数据源id
	 */
	async inquireAnalysisSourceList(
		sourceId: string,
		sourceType: ESourceType
	): Promise<string> {
		let payload: IFAnalysisDataSourceListReqPayload = {
			sourceIds: [sourceId],
			sourceTypes: [sourceType],
			page: 1,
			pageSize: 1
		};
		let results: ListType<
			IFAnalysisSourceDetailInfo
		> = await CollectionAnalysisSourceRequest.getAnalysisSourceList(payload);
		let list: IFAnalysisSourceDetailInfo[] = results.list;
		if (list && list.length > 0) {
			return list[0]['id']; //数据源ID
		} else {
			return '';
		}
	}

	/**
	 * 删除数据源
	 * @param {string} id 传数据源id,非sourceID
	 * @memberof CamerasManagement
	 * @returns {void}
	 */
	deleteAnalysisSourceData = (id: string) => {
		CollectionAnalysisSourceRequest.deleteAnalysisSource(id)
			.then((delSuccess: boolean) => {
				//NOTE:这里不需要提示信息
				// message.success(intl.get('DATA_DELETE_SUCCESS').d('数据源删除成功'));
				console.log('========数据源删除成功=========');
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	/**
	 * 摄像头名称样式设置
	 * @param {string} title 摄像头名称
	 * @memberof CamerasManagement
	 * @returns {void}
	 */
	cameraTitleTextFormat = (title: string) => {
		return (
			<span className={`${StyleSheets['camera-management-title']}`}>
				{title ? title : '---'}
			</span>
		);
	};

	changeAreaToCascadeOption(area: IFAreaInfo): CascaderOptionType {
		let result = {
			value: area.id,
			label: area.name
		};

		if (area.children.length > 0) {
			result['children'] = area.children.map((child: IFAreaInfo) => {
				return this.changeAreaToCascadeOption(child);
			});
		}

		return result;
	}

	render() {
		const columns: Array<ColumnProps<any>> = [
			{
				title: intl.get('CAMERAS_MANAGEMENT_TABLE_AREA').d('区域'),
				key: 'areaName',
				dataIndex: 'areaName'
			},
			{
				title: intl.get('CAMERAS_MANAGEMENT_TABLE_CAMERA_NAME').d('摄像头名称'),
				key: 'name',
				render: (text: string, currentDeviceInfo: any) => {
					return this.cameraTitleTextFormat(currentDeviceInfo.name);
				}
			},
			{
				title: intl.get('CAMERAS_MANAGEMENT_TABLE_IP_ADDRESS').d('IP地址'),
				key: 'ip',
				dataIndex: 'ip'
			},
			{
				title: intl.get('CAMERAS_MANAGEMENT_TABLE_PORT').d('端口号'),
				key: 'port',
				dataIndex: 'port'
			},
			{
				title: intl.get('CAMERAS_MANAGEMENT_FORM_CHANNEL_NUMBER').d('通道号'),
				key: 'channel',
				render: (text: string, itemInfo: any) => itemInfo.channel || '---'
			},
			{
				title: intl.get('CAMERAS_MANAGEMENT_TABLE_OPERATION').d('操作'),
				align: 'center',
				render: (text: string, currentDeviceInfo: any) => (
					<div>
						<Button
							type="primary"
							style={{ marginRight: 10 }}
							onClick={() => this.modifyCamera(currentDeviceInfo)}
						>
							{intl.get('ACCOUNT_DATA_EDIT').d('编辑')}
						</Button>

						<Button
							type="danger"
							ghost
							onClick={this.deleteCameraConfirm.bind(this, currentDeviceInfo)}
						>
							{intl.get('ACCOUNT_DATA_DELETE').d('删除')}
						</Button>
					</div>
				)
			}
		];

		let areaCascadeOption = this.state.areaList.map((area: IFAreaInfo) => {
			return this.changeAreaToCascadeOption(area);
		});

		return (
			<div className={StyleSheets['cameras-management-container']}>
				<div className={StyleSheets['cameras-tool-container']}>
					<span className={StyleSheets['area-select-tip']}>
						{intl.get('CAMERAS_MANAGEMENT_CAMERAS_SELECT').d('区域选择') + '：'}
					</span>
					<Cascader
						changeOnSelect={true}
						options={areaCascadeOption}
						expandTrigger={'hover'}
						onChange={this.areaSelectOnChange}
						placeholder={intl.get('UNITS_OPTION_SELECT_AREA').d('请选择区域')}
						// style={{ width: getvwInJS(320) }}
					/>
					<Input
						placeholder={
							intl.get('CAMERAS_MANAGEMENT_CAMERAS_SEARCH').d('摄像头名称') +
							'/' +
							intl.get('CAMERAS_MANAGEMENT_TABLE_IP_ADDRESS').d('IP地址')
						}
						prefix={<Icon type="search" style={{ color: '#f2f4f5f' }} />}
						onChange={this.cameraSearchOnchange}
						onPressEnter={this.searchStrOnPressEnter}
						className={StyleSheets['camera-search']}
					/>
					<Button
						type="primary"
						onClick={this.addCameraTree}
						icon="plus-circle"
					>
						{intl.get('CAMERAS_MANAGEMENT_CAMERAS_ADDBTN').d('添加设备')}
					</Button>
				</div>

				<div className={StyleSheets['camera-table-block']}>
					<Table
						className={StyleSheets['camera-table-content']}
						rowKey={(currentDeviceInfo) => currentDeviceInfo.id}
						columns={columns}
						dataSource={this.state.cameraList}
						pagination={false}
						// scroll={{ y: 80 }}
						locale={{
							emptyText: (
								<Empty
									description={<span>{intl.get('NO_DATA').d('暂无数据')}</span>}
								/>
							)
						}}
					/>
					<Pagination
						className={StyleSheets['camera-table-pagination']}
						current={this.state.pageNo}
						pageSize={this.state.pageSize}
						total={this.state.total}
						onChange={this.camerasPageChange}
						hideOnSinglePage={this.state.total === 0}
					/>
				</div>

				<Modal
					className={StyleSheets['camera-form-container']}
					title={this.state.cameraControlTitle}
					visible={this.state.modalVisible}
					onCancel={() => this.modalOnCancel('off')}
					footer={null}
					destroyOnClose={true}
					maskClosable={false}
				>
					{
						<CamerasForm
							areaList={this.state.areaList}
							deviceInfo={this.state.currentDeviceInfo}
							visible={this.state.modalVisible}
							modalOnCancel={this.modalOnCancel}
							addCameraHandle={this.addCameraHandle}
							editCameraHandle={this.editCameraHandle}
							refreshCamerasData={this.refreshCamerasData}
						/>
					}
				</Modal>
			</div>
		);
	}
}

export default withUserInfo(CamerasManagement);
