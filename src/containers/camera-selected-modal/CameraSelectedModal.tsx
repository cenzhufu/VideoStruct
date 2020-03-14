import * as React from 'react';
import { Modal, Checkbox, Button } from 'antd';
import * as intl from 'react-intl-universal';
import { IFDeviceInfo } from 'sttypedefine';
import StyleSheets from './assets/cameraSelectedModal.module.scss';
import STComponent from 'stcomponents/st-component';

const CheckboxGroup = Checkbox.Group;

interface PropsType {
	selectedList: Array<IFDeviceInfo>;
	accessedCameraList: Array<IFDeviceInfo>; // 接入的
	onOk: (accessedCameraList: Array<IFDeviceInfo>) => void;
	visible: boolean;
	onCancel: () => void;
}

type OptionType = {
	label: string;
	value: IFDeviceInfo;
};

interface StateType {
	accessedCameraListCopy: Array<IFDeviceInfo>; // 选择的副本
	selectedCameraList: Array<OptionType>;
}

function noop() {}
class CameraSelectedModal extends STComponent<PropsType, StateType> {
	static defaultProps = {
		onOk: noop,
		onCancel: noop,
		visible: false
	};
	constructor(props: PropsType) {
		super(props);
		this.state = {
			accessedCameraListCopy: [],
			selectedCameraList: []
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
		let selectedCameraList: any[] = [];
		if (props.selectedList.length > 0) {
			for (let i = 0; i < props.selectedList.length; i++) {
				let item = props.selectedList[i];
				let obj = {
					label: item.name,
					value: item
				};
				selectedCameraList.push(obj);
			}

			return {
				selectedCameraList: selectedCameraList
			};
		} else {
			return null;
		}
	}

	onSelect = (checkedValues: Array<IFDeviceInfo>) => {
		let accessedCameraListCopy = checkedValues;
		while (accessedCameraListCopy.length > 4) {
			accessedCameraListCopy.shift();
		}
		//从已有摄像头的筛选情况
		this.setState({
			accessedCameraListCopy: accessedCameraListCopy
		});
	};
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
					}/4`}</div>
				</div>
				<Button className={StyleSheets['cancel']} onClick={this.onCancel}>
					{intl.get('cancel---').d('取消')}
				</Button>
				<Button type="primary" onClick={this.onOk}>
					{intl.get('ok----').d('确定')}
				</Button>
			</div>
		);
		return (
			<Modal
				className={StyleSheets['cameraSelected-modal']}
				title={intl.get('cameraSelected-title').d('已选摄像头')}
				visible={this.props.visible}
				onCancel={this.onCancel}
				width="50%"
				footer={Footer}
			>
				{
					<CheckboxGroup
						className={StyleSheets['cameraSelected-item']}
						// @ts-ignore
						options={this.state.selectedCameraList}
						// @ts-ignore
						onChange={this.onSelect}
					/>
				}
			</Modal>
		);
	}
}
export default CameraSelectedModal;
