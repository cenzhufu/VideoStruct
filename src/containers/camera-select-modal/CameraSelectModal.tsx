import * as React from 'react';
import { Modal, Checkbox, Button, message } from 'antd';
import * as ReactDOM from 'react-dom';
import * as intl from 'react-intl-universal';
import { DeviceRequests } from 'stutils/requests/basic-server-request';
import { IFAreaInfo, IFDeviceInfo, ETargetType } from 'sttypedefine';
import CameraSelectTree from 'stcomponents/camera-select-tree';
import ModuleStyle from './assets/styles/index.module.scss';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import STComponent from 'stcomponents/st-component';
import Config from 'stconfig';

type PropsType = {
	// 选填
	selectedList: Array<IFDeviceInfo>;
	showTaskSelect: boolean;
	title: string | React.ReactNode;
	onOk: (selectedList: Array<IFDeviceInfo>, tasks?: Array<ETargetType>) => void;
	onCancel: () => void;

	maxSelectedCount: null | number;

	okEnableInEmptySelectedList: boolean; // 在没有选中任何元素时是否可点击确认
};
type StateType = {
	cameraDataTree: Array<IFAreaInfo>;
	searchStr: string;

	isFaceDetectSelected: boolean;
	isBodyDetectSelected: boolean;

	selectedListWorkCopy: Array<IFDeviceInfo>;
};

function noop() {}
class CameraSelectModal extends STComponent<PropsType, StateType> {
	static defaultProps = {
		selectedList: [],
		showTaskSelect: false,
		title: '',
		onOk: noop,
		onCancel: noop,
		maxSelectedCount: null,
		okEnableInEmptySelectedList: false
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {
			cameraDataTree: [],
			searchStr: '',
			isBodyDetectSelected: true,
			isFaceDetectSelected: true,
			selectedListWorkCopy: [...this.props.selectedList]
		};
	}

	static show(props: Partial<PropsType>) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let element = <CameraSelectModal {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	componentDidMount() {
		//发送请求
		DeviceRequests.getAllDevicesWithAreaInfo()
			.then((res: Array<IFAreaInfo>) => {
				console.log('获取树列表成功', res);
				this.setState({
					cameraDataTree: res
				});
			})
			.catch((error: Error) => {
				console.error(error);
				// TODO: Toast
				message.error(error.message);
			});
	}

	handleItemChange = (deviceList: Array<IFDeviceInfo>) => {
		//
		this.setState({
			selectedListWorkCopy: deviceList
		});
	};

	onChangeFaceDetect = (e: CheckboxChangeEvent) => {
		this.setState({
			isFaceDetectSelected: e.target.checked
		});
	};

	onChangeBodyDetect = (e: CheckboxChangeEvent) => {
		this.setState({
			isBodyDetectSelected: e.target.checked
		});
	};

	onCancel = () => {
		this.props.onCancel();
	};

	_selectedTask() {
		let tasks: Array<ETargetType> = [];
		if (this.state.isFaceDetectSelected) {
			tasks.push(ETargetType.Face);
		}

		if (this.state.isBodyDetectSelected) {
			tasks.push(ETargetType.Body, ETargetType.Handbag);
		}

		return tasks;
	}

	onOk = () => {
		let tasks = Config.getDefaultAnalysisTasks(); // this._selectedTask();

		if (this.canClickOk()) {
			this.props.onOk(this.state.selectedListWorkCopy, tasks);
		}
	};

	canClickOk() {
		if (this.props.okEnableInEmptySelectedList) {
			return true;
		} else {
			return !(
				this.state.selectedListWorkCopy.length <= 0 ||
				this._selectedTask().length <= 0
			);
		}
	}

	render() {
		let disabled = !this.canClickOk();
		let Footer = (
			<div className={ModuleStyle['footer']}>
				<div className={ModuleStyle['footer-tip']}>
					<div>{intl.get('selected-tip').d('已选择') + ':'}</div>
					<div className={ModuleStyle['select-count']}>{`${
						this.state.selectedListWorkCopy.length
					}/${
						this.props.maxSelectedCount
							? this.props.maxSelectedCount
							: this.state.cameraDataTree.length
					}`}</div>
				</div>
				<Button className={ModuleStyle['cancel']} onClick={this.onCancel}>
					{intl.get('cancel---').d('取消')}
				</Button>
				<Button type="primary" onClick={this.onOk} disabled={disabled}>
					{intl.get('ok----').d('确定')}
				</Button>
			</div>
		);
		return (
			<Modal
				className={ModuleStyle['camera-select']}
				visible={true}
				title={intl.get('access-realtime-data').d('接入实时视频')}
				closable={false}
				width={'42%'}
				footer={Footer}
			>
				{this.props.showTaskSelect && (
					<div className={ModuleStyle['analysis-type-select']}>
						<div className={ModuleStyle['analysis-type-tip']}>
							{intl.get('analysis-type').d('选择分析结构类型') + ':'}
						</div>
						<Checkbox
							onChange={this.onChangeFaceDetect}
							checked={this.state.isFaceDetectSelected}
						>
							{intl.get('face-detect').d('人脸分析')}
						</Checkbox>
						<Checkbox
							onChange={this.onChangeBodyDetect}
							checked={this.state.isBodyDetectSelected}
						>
							{intl.get('body-detect').d('人体分析')}
						</Checkbox>
						<Checkbox disabled={true}>
							{intl.get('vehicle-detect').d('车辆分析')}
						</Checkbox>
					</div>
				)}
				<CameraSelectTree
					className={ModuleStyle['camera-select-content']}
					data={this.state.cameraDataTree}
					checkedCameraList={this.props.selectedList || []}
					onChange={this.handleItemChange}
					cameraMaximum={this.props.maxSelectedCount}
				/>
			</Modal>
		);
	}
}

export default CameraSelectModal;
