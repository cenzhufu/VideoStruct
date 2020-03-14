import * as React from 'react';
import SearchStructuralTargetItemList from 'stcomponents/search-structural-target-list';
import { IFStructuralInfo } from 'sttypedefine';
import ModuleStyle from './assets/styles/index.module.scss';
import * as intl from 'react-intl-universal';
import { Button } from 'antd';
import MaskLayer from 'ifvendors/mask-layer';
// import { CutIconComponent } from 'stcomponents/icons';
import STComponent from 'stcomponents/st-component';

function noop() {}

type PropsType = {
	structuralItemList: Array<IFStructuralInfo>;
	onDelete: (structualItemInfo: IFStructuralInfo, index: number) => void;
	maxCount: number;
	children: React.ReactNode;
	onClearAll: () => void;
	onOk: () => void;
	isCropperState: boolean;
	toggleCropperState: (cropper: boolean) => void;
	crop: () => void;
	detectNoFace: boolean;

	isDetecting: boolean;
};

type stateTypes = {};

class SearchPreviewerCropperPanel extends STComponent<PropsType, stateTypes> {
	static defaultProps = {
		structuralItemList: [],
		maxCount: 5,
		children: null,
		onClearAll: noop,
		onOk: noop,
		isCropperState: false,
		toggleCropperState: noop,
		crop: noop,
		detectNoFace: false,
		isDetecting: false
	};

	constructor(props: PropsType) {
		super(props);
		this.state = {};
	}

	onDelete = (structualItemInfo: IFStructuralInfo, index: number) => {
		this.props.onDelete(structualItemInfo, index);
	};

	onClearAll = () => {
		this.props.onClearAll();
	};

	onOk = () => {
		// 过滤数组
		this.props.onOk();
	};

	toggleCropperState = () => {
		this.props.toggleCropperState(!this.props.isCropperState);
	};

	onCropperContent = () => {
		this.props.crop();
	};

	render() {
		return (
			<div className={ModuleStyle['search-previewer-cropper']}>
				<SearchStructuralTargetItemList
					structualItemList={this.props.structuralItemList}
					onDelete={this.onDelete}
					maxCount={this.props.maxCount}
					placeHolder={<div className={ModuleStyle['placeholder']} />}
				>
					<div
						className={ModuleStyle['cropper']}
						onClick={this.toggleCropperState}
					>
						{/* <CutIconComponent /> */}
						<i
							className={`${ModuleStyle['cropper-icon']} ${
								this.props.isCropperState
									? ModuleStyle['cropper-icon-active']
									: ''
							}`}
						/>
					</div>
				</SearchStructuralTargetItemList>
				<div className={ModuleStyle['button-group']}>
					{this.props.isCropperState && (
						<div className={ModuleStyle['crooper-buttons']}>
							<Button
								className={ModuleStyle['cancel-cropper-button']}
								onClick={this.toggleCropperState}
							>
								{intl.get('CROPPER_CANCLE').d('取消')}
							</Button>
							<Button
								className={ModuleStyle['cropper-button']}
								type="primary"
								loading={this.props.isDetecting}
								onClick={this.onCropperContent}
							>
								{this.props.isDetecting
									? intl.get('CROPPER_LOADING').d('检测中')
									: intl.get('CROPPER_DONE').d('完成')}
							</Button>
						</div>
					)}
					{/* <Button
						className={ModuleStyle['clear-all']}
						onClick={this.onClearAll}
					>
						{intl.get('clear-all').d('一键清空')}
					</Button>
					<Button
						type="primary"
						onClick={this.onOk}
						disabled={this.props.structuralItemList.length <= 0}
					>
						{intl.get('confirm').d('确定')}
					</Button> */}
				</div>
				{this.props.children}
				{this.props.isCropperState && (
					<MaskLayer className={ModuleStyle['mask-layer']} />
				)}
			</div>
		);
	}
}

export default SearchPreviewerCropperPanel;
