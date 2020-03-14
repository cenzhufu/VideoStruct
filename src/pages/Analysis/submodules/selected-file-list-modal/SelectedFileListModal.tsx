import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import { Modal, Button } from 'antd';
import * as ReactDOM from 'react-dom';
import * as intl from 'react-intl-universal';
// import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import UploadFileListItem from 'stcomponents/upload-file-list-item';
import { ETargetType } from 'stsrc/type-define';
import STComponent from 'stcomponents/st-component';
import Config from 'stconfig';

type PropsType = {
	files: Array<File>;
	typeValidFiles: Array<File>; // 类型错误的文件,不判断了，直接从外边传得了
	title: string;
	maxFileCount: number;
	fileError?: boolean;
	onCancel: () => void;
	onOk: (selectedFiles: Array<File>, tasks: Array<ETargetType>) => void;
};

type StateType = {
	selectedFiles: Array<File>;
	typeValidFilesCopy: Array<File>;
	isFaceDetectSelected: boolean;
	isBodyDetectSelected: boolean;
	okLoading: boolean;
};

function noop() {}

class SelectedFileListModal extends STComponent<PropsType, StateType> {
	static defaultProps = {
		files: [],
		typeValidFiles: [],
		title: '',
		maxFileCount: 20,
		onCancel: noop,
		onOk: noop
	};

	state = {
		selectedFiles: [...this.props.files],
		typeValidFilesCopy: [...this.props.typeValidFiles],
		isFaceDetectSelected: true,
		isBodyDetectSelected: true,
		okLoading: false
	};

	static show(props: Partial<PropsType> = {}) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let ref = React.createRef<SelectedFileListModal>();
		let element = <SelectedFileListModal ref={ref} {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			},
			update: function update(newProps: Partial<PropsType>) {
				let newElement = <SelectedFileListModal {...newProps} />;
				ReactDOM.render(newElement, container);
			},
			startLoading: function() {
				if (ref.current) {
					ref.current.startLoading();
				}
			},
			stopLoading: function() {
				if (ref.current) {
					ref.current.stopLoading();
				}
			}
		};
	}

	onOk = () => {
		let tasks: Array<ETargetType> = Config.getDefaultAnalysisTasks(); //this._selectedTask();

		let validIndex = 0;
		let totalValidateFiles = this.state.selectedFiles.filter(
			(file: File, index) => {
				let error = this.isValidateFile(file, validIndex);
				if (error) {
					return false;
				} else {
					validIndex++;
					return true;
				}
			}
		);

		if (totalValidateFiles.length > 0 && tasks.length > 0) {
			this.props.onOk(totalValidateFiles, tasks);
		}
	};

	_selectedTask() {
		// 确保Face在Body之前
		let tasks: Array<ETargetType> = [];
		if (this.state.isFaceDetectSelected) {
			tasks.push(ETargetType.Face);
		}

		// 选择Body,则默认带上Handbag
		if (this.state.isBodyDetectSelected) {
			tasks.push(ETargetType.Body, ETargetType.Handbag);
		}

		return tasks;
	}

	startLoading() {
		this.setState({
			okLoading: true
		});
	}

	stopLoading() {
		this.setState({
			okLoading: false
		});
	}

	onCancel = () => {
		this.props.onCancel();
	};

	// onChangeFaceDetect = (e: CheckboxChangeEvent) => {
	// 	this.setState({
	// 		isFaceDetectSelected: e.target.checked
	// 	});
	// };

	// onChangeBodyDetect = (e: CheckboxChangeEvent) => {
	// 	this.setState({
	// 		isBodyDetectSelected: e.target.checked
	// 	});
	// };

	onDelete = (index: number, file: File) => {
		this.setState((prevState: StateType, props: PropsType) => {
			let newFiles = [...prevState.selectedFiles];
			newFiles.splice(index, 1);
			return {
				selectedFiles: newFiles
			};
		});
	};

	onDeleteValidTypeFiles = (index: number, file: File) => {
		this.setState((prevState: StateType, props: PropsType) => {
			let newFiles = [...prevState.typeValidFilesCopy];
			newFiles.splice(index, 1);
			return {
				typeValidFilesCopy: newFiles
			};
		});
	};

	isValidateFile(file: File, order: number): string {
		// 文件大小
		let fileSizeTip = this._isValidateFileSize(file, order);
		if (fileSizeTip) {
			return fileSizeTip;
		}

		let fileNameTip = this._isValidateFileName(file, order);
		if (fileNameTip) {
			return fileNameTip;
		}

		let fileOrderTip = this._isValidateFileOrder(file, order);
		if (fileOrderTip) {
			return fileOrderTip;
		}

		return '';
	}

	_isValidateFileSize(file: File, order: number): string {
		if (file.size / (1024 * 1024 * 1024) > 5) {
			return intl
				.get('ANALYSIS_FILE_NO_BIG_THAN', { size: '5G' })
				.d('文件大小应小于5G');
		} else {
			return '';
		}
	}

	_isValidateFileName(file: File, order: number): string {
		if (file.name.length > 100) {
			return intl
				.get('ANALYSIS_FILE_NAME_NO_MORE_THAN', { count: 100 })
				.d('文件名长度应小于100个字符');
		} else {
			return '';
		}
	}

	_isValidateFileOrder(file: File, order: number): string {
		if (order > 20) {
			return intl
				.get('ANALYSIS_FILE_COUNT_MAX_COUNT', { count: 20 })
				.d('最多选择20个文件');
		} else {
			return '';
		}
	}

	render() {
		let totalValidateFiles = this.state.selectedFiles.reduce(
			(previousValue: number, currentValue: File) => {
				let error = this.isValidateFile(currentValue, previousValue);
				if (error) {
					return previousValue;
				} else {
					return previousValue + 1;
				}
			},
			0
		);

		let disabled = totalValidateFiles <= 0 || this._selectedTask().length <= 0;
		let Footer = (
			<div className={ModuleStyle['footer']}>
				<div className={ModuleStyle['footer-tip']}>
					<div>{intl.get('selected-tip').d('已选择') + ':'}</div>
					<div
						className={ModuleStyle['select-count']}
					>{`${totalValidateFiles}/${this.props.maxFileCount}`}</div>
				</div>
				<Button className={ModuleStyle['cancel']} onClick={this.onCancel}>
					{intl.get('cancel---').d('取消')}
				</Button>
				<Button
					type="primary"
					onClick={this.onOk}
					disabled={disabled}
					loading={this.state.okLoading}
				>
					{intl.get('ok----').d('确定')}
				</Button>
			</div>
		);

		let validateFileIndex = 1;
		return (
			<Modal
				className={ModuleStyle['file-selected-modal']}
				visible={true}
				title={this.props.title}
				closable={false}
				width={'42%'}
				footer={Footer}
			>
				{/* <div className={ModuleStyle['analysis-type-select']}>
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
				</div> */}
				<div className={ModuleStyle['file-list-content']}>
					{this.state.selectedFiles.map((file: File, index: number) => {
						// 有效的文件的顺序
						let fileError = this.isValidateFile(file, validateFileIndex);
						if (!fileError) {
							validateFileIndex++;
						}
						return (
							<UploadFileListItem
								key={`${file.name}_${file.type}_${file.size}`}
								file={file}
								fileError={fileError}
								onDelete={this.onDelete.bind(this, index)}
							/>
						);
					})}
					{this.state.typeValidFilesCopy.map(
						(unvalidFile: File, index: number) => {
							return (
								<UploadFileListItem
									key={`${unvalidFile.name}_${unvalidFile.type}_${
										unvalidFile.size
									}`}
									file={unvalidFile}
									fileError={intl
										.get('SELECTED_FILE_LIST_MODAL_UNVALID_TYPE_FILE')
										.d('文件类型无效')}
									onDelete={this.onDeleteValidTypeFiles.bind(this, index)}
								/>
							);
						}
					)}
				</div>
			</Modal>
		);
	}
}

export default SelectedFileListModal;
