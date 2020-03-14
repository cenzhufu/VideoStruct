import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';

import SearchPreviewerCropperPanel from 'stcomponents/search-previewer-cropper-panel';
import Previewer from 'ifvendors/previewer';
import StructuralListDetectedPanel from 'stcomponents/structual-list-detected-panel';

import { message } from 'antd';

import {
	CollectionResourceRequest,
	IFDetectedStructualInfo
} from 'stutils/requests/collection-request';
import {
	IFStructuralInfo,
	generateUnvalidStructuralInfo,
	ETargetType
} from 'sttypedefine';
import { ImageDisplayMode } from 'ifvendors/image-view';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	originalImageId: Required<string>; // 大图的id
	originalImageUrl: Required<string>; // 大图的链接地址

	visible: boolean;
	title: string | React.ReactNode;
	onClose: () => void;
	maxCount: number;
	onOk: (list: Array<IFStructuralInfo>) => void;
};

type StateType = {
	croppedList: Array<IFStructuralInfo>; // 裁剪检测的列表
	selectedItemList: Array<IFStructuralInfo>;
	prevImageId: string | undefined; // 上一次的imageId
	isCropperState: boolean;
	detectNoFace: boolean;

	isDetecting: boolean; // 是否检测中
};

function noop() {}

type MessagePropsType = {
	// previewRef: React.RefObject<Previewer>;
	// onClose: () => void;
	onSearchAnyway: () => void;
};

class CustomMessage extends STComponent<MessagePropsType> {
	static defaultProps = {
		onSearchAnyway: noop
	};

	onClickSearch = () => {
		this.props.onSearchAnyway();
		// message.destroy();
		// if (this.props.previewRef.current) {
		// 	let result: HTMLCanvasElement | null = this.props.previewRef.current.getCroppedCanvas();
		// 	if (result) {
		// 		this.props.onClose();
		// 		// 转换成图片
		// 		result.toBlob((blob: File) => {
		// 			// 上传图片检测
		// 			this.props
		// 				.detectStructuralInfo(blob)
		// 				.then(async (detectResult: IFDetectedStructualInfo) => {
		// 					if (result) {
		// 						SearchUploadImagePanel.saveMemo(result);
		// 						window.open(
		// 							`${window.location.origin}/structuralize/search/result`
		// 						);
		// 					}
		// 				})
		// 				.catch((error: Error) => {
		// 					console.error(error);
		// 					message.error(error.message);
		// 				});
		// 		}, 'jpg');
		// 	}
		// }
	};
	render() {
		return (
			<div className={ModuleStyle['custom-message-container']}>
				<span>
					{intl
						.get('CUSTOM_MESSAGE_INFO')
						.d('未检测到人脸或人体，是否强制搜索？')}
				</span>
				<span
					className={ModuleStyle['custom-message-btn']}
					onClick={this.onClickSearch}
				>
					{intl.get('CUSTOM_MESSAGE_SEARCH').d('搜索')}
				</span>
			</div>
		);
	}
}
class MultiStructuralUploadPreviewer extends STComponent<PropsType, StateType> {
	static defaultProps = {
		visible: false,
		originalImageId: '',
		originalImageUrl: 'void',
		title: '',
		onClose: noop,
		maxCount: 5,
		onOk: noop
	};

	previewRef: React.RefObject<Previewer>;

	constructor(props: PropsType) {
		super(props);
		this.previewRef = React.createRef<Previewer>();

		this.state = {
			croppedList: [],
			selectedItemList: [],
			prevImageId: undefined,
			isCropperState: false,
			detectNoFace: false,
			isDetecting: false
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
		if (props.originalImageId && props.originalImageId !== state.prevImageId) {
			return {
				prevImageId: props.originalImageId
			};
		}

		return null;
	}

	static show(props: Partial<PropsType> = {}) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let element = (
			<MultiStructuralUploadPreviewer {...{ ...props, visible: true }} />
		);

		ReactDOM.render(element, container);

		return {
			destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	async getStructualListInImage(originalImageId: string) {
		// 大图获取小图
		let newStructuralList: Array<
			IFStructuralInfo
		> = await CollectionResourceRequest.getStructuralInfoFromOriginalImageId(
			originalImageId,
			[ETargetType.Face, ETargetType.Body]
		);

		return newStructuralList;
	}

	/**
	 * 获得结构化的小图信息
	 * @param {File} file 文件
	 * @returns {Promise<IFDetectedStructualInfo>} 检测结果
	 * @memberof SearchSelectDatasourceMainPanel
	 */
	async detectStructuralInfo(file: File): Promise<IFDetectedStructualInfo> {
		// 文件上传检测
		let detectResult: IFDetectedStructualInfo = await CollectionResourceRequest.uploadImageAndDetect(
			file
		);

		return detectResult;
	}

	onDelete = (structualItemInfo: IFStructuralInfo, index: number) => {
		// 删除item
		this.setState((prevState: StateType) => {
			if (index >= 0 && index < prevState.selectedItemList.length) {
				let newCopy = [...prevState.selectedItemList];
				newCopy.splice(index, 1);
				return {
					selectedItemList: newCopy
				};
			} else {
				return null;
			}
		});
	};

	onClearAll = () => {
		this.setState({
			selectedItemList: []
		});
	};

	onOk = (item: IFStructuralInfo) => {
		// const results = [...this.state.selectedItemList];
		this.props.onOk([item]);
	};

	toggleCropperState = (crooper: boolean) => {
		this.setState({
			isCropperState: crooper
		});
	};

	/**
	 * 强制搜索
	 * @memberof MultiStructuralUploadPreviewer
	 * @param {string} imageUrl 图片地址
	 * @returns {void} 无
	 */
	onSearchAnyway = (imageUrl: string) => {
		message.destroy();

		//
		let unvalidStructuralInfo: IFStructuralInfo = generateUnvalidStructuralInfo(
			imageUrl
		);
		this.onOk(unvalidStructuralInfo);
		// this.props.onClose();
	};

	// 裁剪
	crop = () => {
		if (this.previewRef.current) {
			let result: HTMLCanvasElement | null = this.previewRef.current.getCroppedCanvas();
			if (result) {
				// 转换成图片
				this.setState({
					isDetecting: true
				});
				result.toBlob((blob: File) => {
					let url = URL.createObjectURL(blob);
					console.log('---裁剪原图----', { result, url });

					// 上传图片检测
					this.detectStructuralInfo(blob)
						.then(async (detectResult: IFDetectedStructualInfo) => {
							this.getStructualListInImage(detectResult.id).then(
								(list: Array<IFStructuralInfo>) => {
									// TODO: 显示结果
									// eslint-disable-next-line
									this.setState((prevState: StateType) => {
										return {
											croppedList: [...list, ...prevState.croppedList],
											isCropperState: false,
											isDetecting: false
										};
									});
								}
							);
						})
						.catch((error: Error) => {
							console.error(error);
							// message.error(error.message);
							this.setState({
								detectNoFace: true,
								isDetecting: false
							});
							message.warning(
								<CustomMessage
									onSearchAnyway={() => {
										// @ts-ignore
										this.onSearchAnyway(result.toDataURL('image/jpeg'));
									}}
								/>,
								5
							);
							this.setState({
								detectNoFace: false // 重置状态。若不设置这个，第二次点完成后，就一直处于检测中
							});
							// this.setState({
							// 	isCropperState: false
							// });
						});
				}, 'jpg');
			}
		}
	};

	/**
	 * 点击 右边人脸或者人体图片，搜索
	 * @param {IFStructuralInfo} item item
	 * @return {void}
	 */
	onSelect = (item: IFStructuralInfo) => {
		this.onOk(item);
	};

	/**
	 * 判断该图片是否已经选择
	 * @param {IFStructuralInfo} item item
	 * @returns {boolean} 是否
	 */
	_isInSelectedItemList = (item: IFStructuralInfo): boolean => {
		let result: boolean = false;
		const { selectedItemList } = this.state;
		for (let v of selectedItemList) {
			if (v.id === item.id) {
				result = true;
			}
		}
		return result;
	};

	render() {
		return (
			<Previewer
				ref={this.previewRef}
				visible={this.props.visible}
				imageUrl={this.props.originalImageUrl}
				title={this.props.title}
				onClose={this.props.onClose}
				isCropperState={this.state.isCropperState}
				imageMode={ImageDisplayMode.AutoOrginOrAscpectFit}
				right={
					<StructuralListDetectedPanel
						// type={''}
						originalImageId={this.props.originalImageId}
						additionalList={this.state.croppedList}
						className={ModuleStyle['detected-panel']}
						title={intl.get('MULTI_STRUCTAL_QUICK_TO_SEARCH').d('快速检索')}
						onSelect={this.onSelect}
						isFromUpload={true}
						isShowDetail={false}
					/>
				}
			>
				<SearchPreviewerCropperPanel
					structuralItemList={this.state.selectedItemList}
					onDelete={this.onDelete}
					maxCount={this.props.maxCount}
					onClearAll={this.onClearAll}
					// onOk={this.onOk}
					isCropperState={this.state.isCropperState}
					toggleCropperState={this.toggleCropperState}
					crop={this.crop}
					isDetecting={this.state.isDetecting}
					detectNoFace={this.state.detectNoFace} // 控制loading，无人脸则终止loading
				/>
			</Previewer>
		);
	}
}

export default MultiStructuralUploadPreviewer;
