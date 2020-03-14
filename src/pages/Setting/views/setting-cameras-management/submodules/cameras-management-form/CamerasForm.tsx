import * as React from 'react';
import { Form, Button, Input, Cascader, Select, Checkbox, message } from 'antd';
import * as intl from 'react-intl-universal';
import { FormComponentProps } from 'antd/lib/form';
import StyleSheets from './assets/index.module.scss';
import STComponent from 'stcomponents/st-component';
import {
	IFDeviceInfo,
	ETargetType,
	IFAreaInfo,
	ESourceType
} from 'stsrc/type-define';
import { CascaderOptionType } from 'antd/lib/cascader';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import {
	EDeviceWorkType,
	getValidDeviceWorkType
} from 'stsrc/utils/requests/basic-server-request';
import {
	CollectionAnalysisSourceRequest,
	IFAnalysisSourceDetailInfo,
	IFAnalysisTaskInfo,
	CollectionTaskRequest,
	// eslint-disable-next-line
	IFAnalysisTaskProgressInfo,
	// eslint-disable-next-line
	IFEngineConfig
} from 'stsrc/utils/requests/collection-request';
import CheckboxGroup from 'antd/lib/checkbox/Group';

const FormItem = Form.Item;
const { Option } = Select;
// 信了你的邪了，还有这么设计组件的
// 改不动，改不动

interface PropsType extends FormComponentProps {
	deviceInfo?: IFDeviceInfo;
	areaList: IFAreaInfo[];

	visible: boolean;
	addCameraHandle: (
		values: Pick<IFDeviceInfo, Exclude<keyof IFDeviceInfo, 'id' | 'uuid'>>,
		targetTypes: ETargetType[]
	) => void; //添加摄像头
	editCameraHandle: (values: IFDeviceInfo) => void; //编辑摄像头
	modalOnCancel: (record?: string) => void;
	refreshCamerasData: () => void;
}

interface StateType {
	idPaths: string[];
	name: string;
	ip: string;
	port: string;
	channel: string;

	deviceAccount: string;
	devicePassport: string;
	latitude?: number;
	logtitude?: number;

	deviceWorkMode: EDeviceWorkType;
	rtsp: string;

	isFaceSelected: boolean;
	isBodySelected: boolean;
	isVehicleSelected: boolean;

	supportedTaskList: ETargetType[];

	isChecking: boolean;
}

class CamerasForm extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);

		this.state = {
			idPaths: this.isEditMode()
				? this.getIdPath(
						(this.props.deviceInfo as IFDeviceInfo).areaId,
						this.props.areaList
				  )
				: [],
			name: this.props.deviceInfo ? this.props.deviceInfo.name : '',
			ip: this.props.deviceInfo ? this.props.deviceInfo.ip || '' : '',

			port: this.props.deviceInfo ? this.props.deviceInfo.port || '' : '',
			channel: this.props.deviceInfo ? this.props.deviceInfo.channel : '',

			deviceAccount: this.props.deviceInfo
				? this.props.deviceInfo.loginUser
				: '',
			devicePassport: this.props.deviceInfo
				? this.props.deviceInfo.password
				: '',
			latitude: this.props.deviceInfo ? this.props.deviceInfo.lat : undefined,
			logtitude: this.props.deviceInfo ? this.props.deviceInfo.lng : undefined,

			deviceWorkMode: this.props.deviceInfo
				? getValidDeviceWorkType(
						this.props.deviceInfo.captureType,
						EDeviceWorkType.Capture
				  )
				: EDeviceWorkType.Capture,
			rtsp: this.props.deviceInfo ? this.props.deviceInfo.rtsp : '',

			isFaceSelected: false,
			isBodySelected: false,
			isVehicleSelected: false,
			supportedTaskList: [],
			isChecking: false
		};
	}
	componentDidMount() {
		CollectionTaskRequest.getSupportedAnalysisTasks()
			.then((supportedList: Array<ETargetType>) => {
				this.setState({
					supportedTaskList: supportedList,
					isFaceSelected: supportedList.indexOf(ETargetType.Face) !== -1,
					isBodySelected: supportedList.indexOf(ETargetType.Body) !== -1,
					isVehicleSelected: supportedList.indexOf(ETargetType.Vehicle) !== -1
				});
			})
			.catch((error: Error) => {
				console.error(error);
				// 显示默认
			});

		if (this.isEditMode()) {
			// 获取数据源
			CollectionAnalysisSourceRequest.getSingleAnalysisSourceInfo(
				(this.props.deviceInfo as IFDeviceInfo).id,
				ESourceType.Camera
			)
				.then((result: IFAnalysisSourceDetailInfo | null) => {
					if (result) {
						let targetTypes: ETargetType[] = [];
						result.analyzeTasks.forEach((task: IFAnalysisTaskInfo) => {
							task.analyzeType.forEach((targetType: ETargetType) => {
								if (targetTypes.indexOf(targetType) === -1) {
									targetTypes.push(targetType);
								}
							});
						});

						this.setState({
							isFaceSelected: targetTypes.indexOf(ETargetType.Face) !== -1,
							isBodySelected: targetTypes.indexOf(ETargetType.Body) !== -1,
							isVehicleSelected: targetTypes.indexOf(ETargetType.Vehicle) !== -1
						});
					}
				})
				.catch((error: Error) => {
					console.error(error);
				});
		}
	}

	isEditMode(): boolean {
		return this.props.deviceInfo != null;
	}

	getIdPath(id: string, extendAreaList: IFAreaInfo[]): string[] {
		for (let root of extendAreaList) {
			let result = this._getIdPath(id, root, []);
			if (result.length > 0) {
				return result;
			}
		}

		return [];
	}

	_getIdPath(id: string, root: IFAreaInfo, paths: string[] = []): string[] {
		if (!id) {
			return [];
		}

		// eslint-disable-next-line
		if (root.id == id) {
			return [...paths, root.id];
		}

		for (let child of root.children) {
			let result = this._getIdPath(id, child, [...paths, root.id]);
			if (result.length > 0) {
				return result;
			}

			continue;
		}

		return [];
	}

	handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let newInfo: Pick<
					IFDeviceInfo,
					Exclude<keyof IFDeviceInfo, 'id' | 'uuid'>
				> = {
					areaName: values.areaName || '',
					ip: values.ip,
					areaId:
						this.state.idPaths.length > 0
							? this.state.idPaths[this.state.idPaths.length - 1]
							: '0',
					name: values.name,
					loginUser: values.loginUser,
					password: values.password,
					port: values.port,
					channel: values.channel,
					lng: values.longitude,
					lat: values.latitude,

					captureType: this.state.deviceWorkMode,
					rtsp: values.rtsp
				};

				if (!this.isEditMode()) {
					let targetTypes: ETargetType[] = [];
					if (this.state.isFaceSelected) {
						targetTypes.push(ETargetType.Face);
					}

					if (this.state.isBodySelected) {
						targetTypes.push(ETargetType.Body);
					}

					if (this.state.isVehicleSelected) {
						targetTypes.push(ETargetType.Vehicle);
					}
					// 新增

					// 做检测
					this.setState({
						isChecking: true
					});
					Promise.all([
						CollectionTaskRequest.queryAllTaskInfo(),
						CollectionTaskRequest.getEngineConfig()
					])
						.then((result: [IFAnalysisTaskProgressInfo[], IFEngineConfig]) => {
							this.setState({
								isChecking: false
							});
							if (
								result[0].length >=
								result[1].engineTotalNumber - result[1].engineForFileNumber
							) {
								// 可用的摄像头的引擎数量小于
								message.error(
									intl
										.get('eeeeeeeeeeeeeeeeeeeeeeeeeee')
										.d('当前已超过系统所能支持解析设备数量最大值')
								);
							} else {
								this.props.addCameraHandle(newInfo, targetTypes);
							}
						})
						.catch((error: Error) => {
							console.error(error);
							message.error(error.message);

							this.setState({
								isChecking: false
							});
						});
				} else {
					this.props.editCameraHandle({
						...newInfo,
						id: (this.props.deviceInfo as IFDeviceInfo).id,
						uuid: (this.props.deviceInfo as IFDeviceInfo).uuid
					});
				}
			}
		});
	};

	cameraCancel = () => {
		this.props.modalOnCancel();
	};

	onChangeFace = (e: CheckboxChangeEvent) => {
		this.setState({
			isFaceSelected: e.target.checked
		});
	};

	onChangeBody = (e: CheckboxChangeEvent) => {
		this.setState({
			isBodySelected: e.target.checked
		});
	};

	onChangeVehicle = (e: CheckboxChangeEvent) => {
		this.setState({
			isVehicleSelected: e.target.checked
		});
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

	onChangeRtsp = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			rtsp: event.target.value
		});
	};

	onChangeCaptureType = (value: EDeviceWorkType) => {
		this.setState(
			{
				deviceWorkMode: value
			},
			() => {
				this.props.form.setFieldsValue({
					mode: value
				});
			}
		);
	};

	areaSelectOnChange = (
		value: string[],
		selectedOptions?: CascaderOptionType[]
	) => {
		this.setState(
			{
				idPaths: value
			},
			() => {
				this.props.form.setFieldsValue({
					areaId: value
				});
			}
		);
	};

	onTargetChange = (checkedValue: ETargetType[]) => {
		let faceSelected = checkedValue.indexOf(ETargetType.Face) !== -1;
		let bodySelected = checkedValue.indexOf(ETargetType.Body) !== -1;
		let carSelected = checkedValue.indexOf(ETargetType.Vehicle) !== -1;
		this.setState(
			{
				isFaceSelected: faceSelected,
				isBodySelected: bodySelected,
				isVehicleSelected: carSelected
			},
			() => {
				this.props.form.setFieldsValue({
					targets: checkedValue
				});
			}
		);
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		let ipReg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		let portReg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-6])$/;
		let engAndChsReg = /^[\u4e00-\u9fa5a-zA-Z0-9]{0,20}$/;
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 6 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 }
			}
		};

		let targets = this.state.supportedTaskList;
		let supportFace = targets.indexOf(ETargetType.Face) !== -1 ? true : false;
		let supportBody = targets.indexOf(ETargetType.Body) !== -1 ? true : false;
		let supportCar = targets.indexOf(ETargetType.Vehicle) !== -1 ? true : false;

		let initTargetTypes: ETargetType[] = [];
		if (this.state.isFaceSelected) {
			initTargetTypes.push(ETargetType.Face);
		}

		if (this.state.isBodySelected) {
			initTargetTypes.push(ETargetType.Body);
		}

		if (this.state.isVehicleSelected) {
			initTargetTypes.push(ETargetType.Vehicle);
		}

		return (
			<div className={StyleSheets['add-camera-container']}>
				<Form onSubmit={this.handleSubmit} className={StyleSheets['form']}>
					<FormItem {...formItemLayout} label="所属区域">
						{getFieldDecorator('areaId', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_CASCADER')
										.d('请选择摄像头所属区域')
								}
							],
							initialValue: this.state.idPaths
						})(
							<Cascader
								changeOnSelect={true}
								notFoundContent="没有找到该区域"
								// showSearch={true}
								options={this.props.areaList.map((area: IFAreaInfo) => {
									return this.changeAreaToCascadeOption(area);
								})}
								onChange={this.areaSelectOnChange}
								expandTrigger={'hover'}
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_CASCADER')
									.d('请选择摄像头所属区域')}
							/>
						)}
					</FormItem>
					{/* {this.state.cameraControlType === 'add' ? ( */}
					<FormItem {...formItemLayout} label="摄像头名称">
						{getFieldDecorator('name', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_NAME')
										.d('请输入不超过20位中英文字符'),
									max: 20,
									pattern: engAndChsReg
								}
							],
							initialValue: this.state.name
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_NAME')
									.d('请输入不超过20位中英文字符')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="IP地址">
						{getFieldDecorator('ip', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_IP_MESSAGE')
										.d('请输入正确的IP地址'),
									pattern: ipReg
								}
							],
							initialValue: this.state.ip
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_IP')
									.d('请输入IP地址(如:192.168.11.11)')}
							/>
						)}
					</FormItem>
					{
						<FormItem {...formItemLayout} label="端口号">
							{getFieldDecorator('port', {
								rules: [
									{
										required: true,
										message: intl
											.get('CAMERAS_MANAGEMENT_FORM_MESSAGE')
											.d('请输入正确的端口号'),
										min: 0,
										max: 5,
										pattern: portReg
									}
								],
								initialValue: this.state.port
							})(
								<Input
									placeholder={intl
										.get('CAMERAS_MANAGEMENT_FORM_PORT')
										.d('请输入端口号')}
								/>
							)}
						</FormItem>
					}
					<FormItem
						{...formItemLayout}
						label={intl
							.get('CAMERAS_MANAGEMENT_FORM_CHANNEL_NUMBER')
							.d('通道号')}
					>
						{getFieldDecorator('channel', {
							initialValue: this.state.channel
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_CHANNEL')
									.d('请输入通道号')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="账号">
						{getFieldDecorator('loginUser', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_LOGINUSER')
										.d('请输入账号')
								}
							],
							initialValue: this.state.deviceAccount
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_LOGINUSER')
									.d('请输入账号')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="密码">
						{getFieldDecorator('password', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_PASSWORD')
										.d('请输入密码')
								}
							],
							initialValue: this.state.devicePassport
						})(
							<Input
								type="password"
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_PASSWORD')
									.d('请输入密码')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="经度">
						{getFieldDecorator('longitude', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_LONGITUDE')
										.d('请输入经度'),
									pattern: /^(\-|\+)?((([0-9]|([1-9][0-9])|(1[0-7][0-9]))(\.\d{1,6})?)|([1][8][0]))$/
								}
							],
							initialValue: this.state.logtitude || ''
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_LONGITUDE')
									.d('请输入经度')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="纬度">
						{getFieldDecorator('latitude', {
							rules: [
								{
									required: true,
									message: intl
										.get('CAMERAS_MANAGEMENT_FORM_LATITUDE')
										.d('请输入纬度'),
									pattern: /^(\-|\+)?((([1-9]|([1-8][0-9]))(\.\d{1,6})?)|([9][0]))$/
								}
							],
							initialValue: this.state.latitude || ''
						})(
							<Input
								placeholder={intl
									.get('CAMERAS_MANAGEMENT_FORM_LATITUDE')
									.d('请输入纬度')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="摄像头模式">
						{getFieldDecorator('mode', {
							rules: [
								{
									required: true,
									message: intl
										.get('--------------------------')
										.d('请选择摄像头模式')
								}
							],
							initialValue: this.state.deviceWorkMode
						})(
							<Select onChange={this.onChangeCaptureType}>
								<Option value={EDeviceWorkType.Capture}>抓拍模式</Option>
								<Option value={EDeviceWorkType.RTSP}>RTSP模式</Option>
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="rtsp地址">
						{getFieldDecorator('rtsp', {
							rules: [
								{
									required: this.state.deviceWorkMode === EDeviceWorkType.RTSP,
									message: intl.get('------------------').d('请输入rtsp地址')
								}
							],
							initialValue: this.state.rtsp
						})(
							<Input
								maxLength={100}
								onChange={this.onChangeRtsp}
								// value={this.state.rtsp}
								disabled={this.state.deviceWorkMode !== EDeviceWorkType.RTSP}
								placeholder={intl
									.get('-------------------------')
									.d('请输入rtsp地址(如 rtsp://account:password@IP address)')}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="解析类型">
						{getFieldDecorator('targets', {
							rules: [
								{
									required: this.isEditMode() ? false : true,
									message: intl
										.get('--------------------------')
										.d('请选择解析类型')
								}
							],
							initialValue: initTargetTypes
						})(
							<CheckboxGroup onChange={this.onTargetChange}>
								{supportFace && (
									<Checkbox
										value={ETargetType.Face}
										disabled={!supportFace || this.isEditMode()}
										checked={this.state.isFaceSelected}
										// onChange={this.onChangeFace}
									>
										{intl.get('deeeeeeeeeee').d('人脸分析')}
									</Checkbox>
								)}
								{supportBody && (
									<Checkbox
										value={ETargetType.Body}
										disabled={!supportBody || this.isEditMode()}
										checked={this.state.isBodySelected}
										// onChange={this.onChangeBody}
									>
										{intl.get('deeeeeeeeeee').d('人体分析')}
									</Checkbox>
								)}
								{supportCar && (
									<Checkbox
										value={ETargetType.Vehicle}
										disabled={!supportCar || this.isEditMode()}
										checked={this.state.isVehicleSelected}
										// onChange={this.onChangeVehicle}
									>
										{intl.get('deeeeeeeeeee').d('车辆分析')}
									</Checkbox>
								)}
							</CheckboxGroup>
						)}
					</FormItem>
				</Form>
				<div className={StyleSheets['footer']}>
					<Button
						type="ghost"
						className={`${StyleSheets['camera-add-cancel']}`}
						onClick={this.cameraCancel}
					>
						{intl.get('CANCLE_BTN').d('取消')}
					</Button>
					<Button
						type="primary"
						onClick={this.handleSubmit}
						loading={this.state.isChecking}
					>
						{intl.get('CAMERAS_MANAGEMENT_FORM_SUBMIT').d('确定')}
					</Button>
				</div>
			</div>
		);
	}
}
export default Form.create()(CamerasForm);
