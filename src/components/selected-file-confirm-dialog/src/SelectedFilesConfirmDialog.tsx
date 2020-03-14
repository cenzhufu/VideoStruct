import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Checkbox, message, Button } from 'antd';
import * as intl from 'react-intl-universal';
import ModuleStyle from './index.module.scss';
import { ETargetType, ESourceType } from 'stsrc/type-define';
import UploadFileListItem from 'stsrc/components/upload-file-list-item';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CollectionTaskRequest } from 'stsrc/utils/requests/collection-request';
import {
	CenterRequests,
	IFEngineStatus,
	IFEngineTargetStatus
} from 'stsrc/utils/requests/center/center-request';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
import { convertAcceptTypeToMimeType } from 'ifvendors/utils/file-select';
import Config from 'stsrc/utils/config';

interface PropsType {
	files: File[];
	unvalidFiles: File[];
	onDeleteFile: (file: File) => void;
	onCancel: () => void;
	onOk: (
		files: File[],
		unvalidFiles: File[],
		targetTypes: ETargetType[]
	) => void;
	visible: boolean;
	afterClose: () => void;
}

interface StateType {
	isFaceSelected: boolean;
	isBodySelected: boolean;
	isVehicleSelected: boolean;

	supportedTaskList: ETargetType[];

	isChecking: boolean;
}

class SelectedFilesConfirmDialog extends STComponent<PropsType, StateType> {
	static defaultProps = {
		files: [],
		unvalidFiles: [],
		onDeleteFile: () => {},
		onCancel: () => {},
		onOk: () => {},
		afterClose: () => {},
		visible: true
	};

	state = {
		isFaceSelected: false,
		isBodySelected: false,
		isVehicleSelected: false,
		supportedTaskList: [],
		isChecking: false
	};

	static show(props: Partial<PropsType>) {
		let container = document.createElement('div');
		document.body.appendChild(container);
		let element = <SelectedFilesConfirmDialog {...props} visible={true} />;

		ReactDOM.render(element, container);
		return {
			destory: function destory() {
				function afterClose() {
					ReactDOM.unmountComponentAtNode(container);
					container.remove();
				}
				let element = (
					<SelectedFilesConfirmDialog visible={false} afterClose={afterClose} />
				);
				ReactDOM.render(element, container);
			},
			update: function update(newProps: Partial<PropsType>) {
				let mergedProps = {
					...props,
					...newProps
				};
				let newElement = <SelectedFilesConfirmDialog {...mergedProps} />;
				ReactDOM.render(newElement, container);
			}
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
	}

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

	onDelete = (file: File) => {
		this.props.onDeleteFile(file);
	};

	canGoOn(): boolean {
		return (
			(this.state.isFaceSelected ||
				this.state.isBodySelected ||
				this.state.isVehicleSelected) &&
			(this.props.files.length > 0 || this.props.unvalidFiles.length > 0)
		);
	}

	onCancel = () => {
		this.props.onCancel();
	};

	getSourceTypesFromFiles(files: File[]): ESourceType[] {
		let set = new Set();
		for (let file of files) {
			let type = this.getSourceTypeFromFile(file);
			if (type !== ESourceType.Unknown) {
				set.add(type);
			}
		}

		return Array.from(set);
	}

	getSourceTypeFromFile(file: File): ESourceType {
		let videoExts = convertAcceptTypeToMimeType(
			Config.getSupportedVideoFormat().join(',')
		);

		let zipExts = convertAcceptTypeToMimeType(
			Config.getSupportedRarFormat().join(',')
		);

		let extend = file.name.slice(file.name.lastIndexOf('.'));

		if (videoExts.has(extend)) {
			return ESourceType.Video;
		}

		if (zipExts.has(extend)) {
			return ESourceType.Zip;
		}

		return ESourceType.Unknown;
	}

	isEngineOk(
		engineStatus: IFEngineStatus,
		targetTypes: ETargetType[],
		sourceTypes: ESourceType[]
	): string {
		let engineCapabilities: IFEngineTargetStatus[] = ValidateTool.getValidArray(
			engineStatus.engineCapability
		);

		// 需要哪些sourceTypes
		for (let targetType of targetTypes) {
			if (targetType === ETargetType.Unknown) {
				continue;
			}

			for (let sourceType of sourceTypes) {
				if (sourceType === ESourceType.Unknown) {
					continue;
				}
				// 查找引擎的能力

				let find: boolean = false;
				for (let capability of engineCapabilities) {
					if (
						capability.target === targetType &&
						capability.sourceType.indexOf(sourceType) !== -1
					) {
						find = true;
					}
				}

				// 没有找到
				if (!find) {
					// tip
					let tip = '';
					switch (targetType) {
						case ETargetType.Face:
							tip = intl.get('ANALYSIS_INFO_TARGET_FACE').d('人脸');
							break;

						case ETargetType.Body:
							tip = intl.get('ANALYSIS_INFO_TARGET_BODY').d('人体');
							break;
						case ETargetType.Vehicle:
							tip = intl.get('ANALYSIS_INFO_TARGET_CAR').d('车辆');
							break;

						default:
							break;
					}
					return intl.get('ddddddddddddddddd').d(`当前不支持${tip}引擎`);
				}
			}
		}

		return '';
	}

	onOk = () => {
		if (this.canGoOn()) {
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

			// 做检测
			this.setState({
				isChecking: true
			});
			CenterRequests.getEngineStatus()
				.then((result: IFEngineStatus) => {
					this.setState({
						isChecking: false
					});

					let tip = this.isEngineOk(
						result,
						targetTypes,
						this.getSourceTypesFromFiles(this.props.files)
					);
					if (tip) {
						message.warn(tip);
					} else {
						// 判断引擎的能力
						this.props.onOk(
							this.props.files,
							this.props.unvalidFiles,
							targetTypes
						);
					}
				})
				.catch((error: Error) => {
					console.error(error);
					message.error(error.message);

					this.setState({
						isChecking: false
					});
				});
		}
	};

	afterClose = () => {};

	_renderTaskTypes() {
		let targets = this.state.supportedTaskList as ETargetType[];

		let supportFace = targets.indexOf(ETargetType.Face) !== -1 ? true : false;
		let supportBody = targets.indexOf(ETargetType.Body) !== -1 ? true : false;
		let supportCar = targets.indexOf(ETargetType.Vehicle) !== -1 ? true : false;
		return (
			<div className={ModuleStyle['target-type-checks']}>
				{supportFace && (
					<Checkbox
						key={ETargetType.Face}
						disabled={!supportFace}
						onChange={this.onChangeFace}
						checked={this.state.isFaceSelected}
					>
						{intl.get('deeeeeeeeeee').d('人脸解析')}
					</Checkbox>
				)}
				{supportBody && (
					<Checkbox
						key={ETargetType.Body}
						disabled={!supportBody}
						onChange={this.onChangeBody}
						checked={this.state.isBodySelected}
					>
						{intl.get('deeeeeeeeeee').d('人体解析')}
					</Checkbox>
				)}
				{supportCar && (
					<Checkbox
						key={ETargetType.Vehicle}
						disabled={!supportCar}
						onChange={this.onChangeVehicle}
						checked={this.state.isVehicleSelected}
					>
						{intl.get('deeeeeeeeeee').d('车辆解析')}
					</Checkbox>
				)}
			</div>
		);
	}

	_renderFileList() {
		return (
			<div className={ModuleStyle['file-list']}>
				{this.props.files.map((file: File, index: number) => {
					return (
						<UploadFileListItem
							className={ModuleStyle['file-item']}
							key={`${file.name}_${index}`}
							file={file}
							onDelete={this.onDelete}
						/>
					);
				})}
				{this.props.unvalidFiles.map((file: File, index: number) => {
					return (
						<UploadFileListItem
							className={ModuleStyle['file-item']}
							key={`${file.name}_${index}`}
							file={file}
							onDelete={this.onDelete}
						/>
					);
				})}
			</div>
		);
	}

	render() {
		let footer = (
			<div>
				<Button onClick={this.onCancel}>
					{intl.get('ddd11111').d('取消')}
				</Button>
				<Button
					type="primary"
					disabled={!this.canGoOn()}
					loading={this.state.isChecking}
					onClick={this.onOk}
				>
					{intl.get('ddd').d('确定')}
				</Button>
			</div>
		);

		return (
			<Modal
				destroyOnClose={true}
				maskClosable={false}
				afterClose={this.props.afterClose}
				title={intl.get('----------------').d('选择解析类型')}
				wrapClassName={ModuleStyle['selected-files-confirm-dialog']}
				visible={this.props.visible}
				footer={footer}
				onCancel={this.onCancel}
				onOk={this.onOk}
				okButtonProps={{
					disabled: !this.canGoOn(),
					loading: this.state.isChecking
				}}
			>
				<div className={ModuleStyle['conttent']}>
					{this._renderTaskTypes()}
					{this._renderFileList()}
				</div>
			</Modal>
		);
	}
}

export default SelectedFilesConfirmDialog;
