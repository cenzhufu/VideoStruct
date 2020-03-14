import * as React from 'react';
import { Modal, Checkbox, Button } from 'antd';
import * as intl from 'react-intl-universal';
import { IFDeviceInfo } from 'sttypedefine';
import StyleSheets from './assets/cameraSelectedModal.module.scss';
import STComponent from 'stcomponents/st-component';
import * as ReactDOM from 'react-dom';
const CheckboxGroup = Checkbox.Group;

interface PropsType {
	maxAccessCount: number; // 最大的接入数量
	selectedCameraList: Array<IFDeviceInfo>;
	accessedCameraList: Array<IFDeviceInfo>; // 接入的
	onOk: (accessedCameraList: Array<IFDeviceInfo>) => void;
	visible: boolean;
	onCancel: () => void;
}

type OptionType = {
	label: string;
	value: string;
};

interface StateType {
	accessedCameraListCopy: Array<IFDeviceInfo>; // 选择的副本
	cameraListForDisplay: Array<OptionType>;
}

function noop() {}
class AccessCameraPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		maxAccessCount: 4,
		onOk: noop,
		onCancel: noop,
		visible: false,
		accessedCameraList: [],
		selectedCameraList: []
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			accessedCameraListCopy: [...props.accessedCameraList],
			cameraListForDisplay: []
		};
	}

	static show(props: PropsType) {
		let container = document.createElement('div');
		document.body.appendChild(container);
		let element = <AccessCameraPanel {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	/**
	 * 初始化和重新渲染之前回调函数
	 * @NOTE: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
	 * @param {PropsType} props props
	 * @param {StateType} state state
	 * @returns {null | StateType} 返回Object来更新state, 返回null表明新的props不会引起state的更新
	 */
	static getDerivedStateFromProps(
		props: PropsType,
		state: StateType
	): Partial<StateType> | null {
		let cameraListForDisplay: any[] = [];
		if (props.selectedCameraList.length > 0) {
			for (let i = 0; i < props.selectedCameraList.length; i++) {
				let item = props.selectedCameraList[i];
				let obj = {
					label: item.name,
					value: item.id
				};
				cameraListForDisplay.push(obj);
			}
		}

		return {
			cameraListForDisplay: cameraListForDisplay
		};
	}

	onSelect = (checkedValues: Array<string>) => {
		// 通过id找item

		let accessedCameraListCopy = this._getSelectedCameraList(checkedValues);
		while (accessedCameraListCopy.length > this.props.maxAccessCount) {
			accessedCameraListCopy.shift();
		}
		//从已有摄像头的筛选情况
		this.setState({
			accessedCameraListCopy: accessedCameraListCopy
		});
	};

	_getSelectedCameraList(cameraIds: Array<string> = []) {
		let result: Array<IFDeviceInfo> = [];
		for (let cameraId of cameraIds) {
			for (let cameraInfo of this.props.selectedCameraList) {
				if (cameraId && cameraId === cameraInfo.id) {
					result.push(cameraInfo);
				}
			}
		}

		return result;
	}
	onOk = () => {
		this.props.onOk(this.state.accessedCameraListCopy);
	};
	onCancel = () => {
		// TODO: 取消
		this.props.onCancel();
	};
	render() {
		let Footer = (
			<div className={StyleSheets['footer']}>
				<div className={StyleSheets['footer-tip']}>
					<div>{intl.get('selected-tip').d('已选择') + ':'}</div>
					<div className={StyleSheets['select-count']}>{`${
						this.state.accessedCameraListCopy.length
					}/${this.props.maxAccessCount}`}</div>
				</div>
				<Button className={StyleSheets['cancel']} onClick={this.onCancel}>
					{intl.get('cancel---').d('取消')}
				</Button>
				<Button type="primary" onClick={this.onOk}>
					{intl.get('ok----').d('确定')}
				</Button>
			</div>
		);

		let selectedCameraValue: string[] = this.state.accessedCameraListCopy.map(
			(item: IFDeviceInfo) => {
				return item.id;
			}
		);
		return (
			<Modal
				maskClosable={false}
				className={StyleSheets['cameraSelected-modal']}
				title={intl.get('cameraSelected-title').d('已选摄像头')}
				visible={this.props.visible}
				onCancel={this.onCancel}
				width="50%"
				footer={Footer}
			>
				{
					<CheckboxGroup
						value={selectedCameraValue}
						className={StyleSheets['cameraSelected-item']}
						// @ts-ignore
						options={this.state.cameraListForDisplay}
						// @ts-ignore
						onChange={this.onSelect}
					/>
				}
			</Modal>
		);
	}
}
export default AccessCameraPanel;
