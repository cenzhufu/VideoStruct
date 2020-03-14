import * as React from 'react';
import IFComponent from 'ifvendors/if-component';
import { message } from 'antd';
import * as intl from 'react-intl-universal';
import { IFStructuralInfo } from 'stsrc/type-define';
import SearchTargetPanel from './submodules/search-target-panel';
import FileSelect, {
	convertAcceptTypeToMimeType
} from 'ifvendors/utils/file-select';
import {
	IFDetectedStructualInfo,
	CollectionResourceRequest
} from 'stsrc/utils/requests/collection-request';
import StringTool from 'stsrc/utils/foundations/string';
import FileRequest, {
	FileUploadResDataType,
	toDetectedInfoFromFileUploadResult
} from 'stsrc/utils/requests/file-server-requests';
import { NoDetectResultError } from 'stsrc/utils/errors';
export interface IFDetectOptions {
	title: string;
}
interface PropsType {
	className?: string;
	style?: React.CSSProperties;

	structualItemList: Array<IFStructuralInfo>;
	maxCount: number;

	onDelete: (structualItemInfo: IFStructuralInfo, index: number) => void;
	onClick: (
		structuralItemInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 点击事件

	onDropStructuralInfo: (structualItemInfo: IFStructuralInfo) => void;

	// 检测到属性
	onDetectStructuralInfo: (
		info: IFDetectedStructualInfo,
		options: Partial<IFDetectOptions>
	) => void;

	onStartLoadFile: () => void; // 开始上传检测
	onFinishedLoadFile: () => void;
	onLoadFileError: (error: Error) => void;
	deletable: boolean;
}

interface StatesType {}

function noop() {}

const _file_key = 'SearchUploadImagePanel_key';
const IMAGE_ACCEPT: string = 'image/jpg,image/jpeg,.bmp,.png';

class SearchUploadImagePanel extends IFComponent<PropsType, StatesType> {
	static defaultProps = {
		onDelete: noop,
		onClick: noop,
		onChange: noop,
		onDetectStructuralInfo: noop,
		onDropStructuralInfo: noop,
		onStartLoadFile: noop,
		onFinishedLoadFile: noop,
		onLoadFileError: noop,
		maxCount: 5,
		deletable: false
	};

	constructor(props: PropsType) {
		super(props);

		let str = SearchUploadImagePanel.getMemo();
		if (str) {
			// to blob
			let blob: Blob | null = StringTool.dataUriToBlob(str);
			if (blob) {
				this.handleFile(blob);
			}
		}
		SearchUploadImagePanel.clearMemo();
		this.state = {};
	}
	static saveMemo(canvas: HTMLCanvasElement) {
		if (canvas) {
			let dataUrl = canvas.toDataURL('image/jpeg', 1);
			window.localStorage.setItem(_file_key, dataUrl);
		}
	}

	static getMemo(): string | null {
		let memoStr: string | null = window.localStorage.getItem(_file_key);
		return memoStr;
	}

	static clearMemo() {
		window.localStorage.removeItem(_file_key);
	}

	//获取页面拖拽文件
	onDrop = (structuralInfo: IFStructuralInfo) => {
		this.props.onDropStructuralInfo(structuralInfo);
	};

	/**
	 * 点击上传照片检索
	 * @returns {void}
	 * @memberof SearchResultPage
	 */
	handleClickUpload = () => {
		FileSelect.showFileSelectDialog(
			{
				accept: IMAGE_ACCEPT,
				multiple: false
			},
			(files: Array<File>) => {
				if (files.length > 0) {
					this.handleFile(files[0]);
				} else {
					message.warn(
						intl.get('SEACH_UPLOAD_IMAGE_UNVALID_FILE').d('无效的文件')
					);
				}
			}
		);
	};

	onDropFiles = (files: Array<File>) => {
		let validTypes: Set<string> = convertAcceptTypeToMimeType(IMAGE_ACCEPT);

		let validFiles: Array<File> = [];
		for (let i = 0; i < files.length; i++) {
			let file: File = files[i];

			// 文件扩展名
			let name = file.name;
			let fileExtend = name.substr(name.lastIndexOf('.'));
			if (validTypes.has(fileExtend.toLowerCase())) {
				validFiles.push(file);
			}
		}
		if (validFiles.length > 0) {
			this.handleFile(validFiles[0], validFiles[0].name);
		} else {
			message.warn(intl.get('SEACH_UPLOAD_IMAGE_UNVALID_FILE').d('无效的文件'));
		}

		// if (files.length > 0) {
		// 	this.handleFile(files[0], files[0].name);
		// }
	};

	onDelete = (structuralInfo: IFStructuralInfo, index: number) => {
		this.props.onDelete(structuralInfo, index);
	};

	/**
	 * 处理上传图片以及获得小图信息的过程
	 * @param {Blob} file 文件
	 * @param {string} title title
	 * @returns {void}
	 * @memberof SearchSelectDatasourceMainPanel
	 */
	handleFile(file: Blob, title: string = ''): void {
		this.setState({
			uploading: true
		});

		let reg = /(jpg|jpeg|png|bmp)/;

		let bigfileSize = file.size / (1024 * 1024) > 10;

		if (!reg.test(file.type)) {
			message.warning(
				intl
					.get('UPLOAD_IMAGE_ONLY_ACCEPTED')
					.d('只支持.jpg, .jpeg,.png,.bmp格式的文件')
			);
			return;
		}

		if (bigfileSize) {
			message.warning(
				intl.get('IMG_SIZE_MORE_TANN_TIP').d('上传的图片不能大于10M！')
			);
			return;
		}
		if (
			reg.test(file.type) &&
			this.props.structualItemList.length < this.props.maxCount
		) {
			this.props.onStartLoadFile();
			this.detectStructuralInfo(file)
				.then(async (detectResult: IFDetectedStructualInfo) => {
					this.setState({
						uploading: false
					});
					this.props.onDetectStructuralInfo(detectResult, {
						title: title
					});

					this.props.onFinishedLoadFile();
				})
				// .catch(async (error) => {
				// 	// 二期强制搜索逻辑
				// 	// 检测失败后调用文件上传
				// 	let info: FileUploadResDataType = await this.uploadFile(file);

				// 	this.setState({
				// 		uploading: false
				// 	});

				// 	// 模拟一个假的检测结果
				// 	let detectInfo: IFDetectedStructualInfo = toDetectedInfoFromFileUploadResult(
				// 		info
				// 	);
				// 	this.props.onDetectStructuralInfo(detectInfo, {
				// 		title: title
				// 	});

				// 	this.props.onFinishedLoadFile();
				// })
				.catch(async (error: Error) => {
					this.setState({
						uploading: false
					});
					if (error instanceof NoDetectResultError) {
						// 未检测到结果的error
						let info: FileUploadResDataType = await this.uploadFile(file);
						this.setState({
							uploading: false
						});
						// 模拟一个假的检测结果
						let detectInfo: IFDetectedStructualInfo = toDetectedInfoFromFileUploadResult(
							info
						);
						this.props.onDetectStructuralInfo(detectInfo, {
							title: title
						});
						this.props.onFinishedLoadFile();
					} else {
						this.props.onLoadFileError(error);
					}
				});
		} else {
			console.log(`最多上传${this.props.maxCount}张`);
		}
	}

	//
	uploadFile(file: Blob) {
		return FileRequest.uploadImageFile(file);
	}

	/**
	 * 获得结构化的小图信息
	 * @param {File} file 文件
	 * @returns {Promise<IFDetectedStructualInfo>} 检测结果
	 * @memberof SearchSelectDatasourceMainPanel
	 */
	async detectStructuralInfo(file: Blob): Promise<IFDetectedStructualInfo> {
		// 文件上传检测
		let detectResult: IFDetectedStructualInfo = await CollectionResourceRequest.uploadImageAndDetect(
			file
		);
		return detectResult;
	}

	render() {
		const { structualItemList } = this.props;

		return (
			<SearchTargetPanel
				targetList={structualItemList}
				onDropFiles={this.onDropFiles}
				onDrop={this.onDrop}
				onSelectFile={this.handleClickUpload}
				maxCount={this.props.maxCount}
				onDelete={this.onDelete}
				deletable={this.props.deletable}
			/>
		);
	}
}

export default SearchUploadImagePanel;
