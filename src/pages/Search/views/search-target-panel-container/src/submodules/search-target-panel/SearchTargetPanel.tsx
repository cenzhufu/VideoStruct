import IFComponent from 'ifvendors/if-component';
import * as React from 'react';
import ModuleStyle from './index.module.scss';
import { IFStructuralInfo, ETargetType } from 'stsrc/type-define';
import DroppableArea from 'ifvendors/droppable-area';
import * as intl from 'react-intl-universal';
import { guid } from 'ifvendors/utils/guid';
import { StructuralItem } from 'stcomponents/structural-item';
import { Popover } from 'antd';
import { EThumbFlag } from 'stsrc/utils/requests/tools';

type PropsType = {
	targetList: Array<IFStructuralInfo>;

	maxCount: number;
	onDropFiles: (files: Array<File>) => void;
	onDrop: (structuralInfo: IFStructuralInfo) => void;
	onSelectFile: () => void;
	onDelete: (structualItemInfo: IFStructuralInfo, index: number) => void;
	deletable: boolean;
};

function noop() {}
class SearchTargetPanel extends IFComponent<PropsType> {
	static defaultProps = {
		targetList: [],
		onDropFiles: noop,
		onSelectFile: noop,
		onDrop: noop,
		onDelete: noop,
		maxCount: 5,
		deletable: false
	};

	onDragEnter = () => {};

	dropFiles = (files: Array<File>) => {
		// 拖拽文件
		if (this.props.targetList.length < this.props.maxCount) {
			this.props.onDropFiles(files);
		}
	};

	onDragLeave = () => {};

	onDrop = (dragData: Object) => {
		// 拖拽
		if (this.props.targetList.length < this.props.maxCount) {
			let structureInfo = dragData as IFStructuralInfo;
			// 重新生成uuid
			structureInfo.uuid = guid();
			this.props.onDrop(structureInfo);
		}
	};

	handleClickUpload = () => {
		if (this.props.targetList.length < this.props.maxCount) {
			this.props.onSelectFile();
		}
	};

	onDelete = (structualItemInfo: IFStructuralInfo, index: number) => {
		this.props.onDelete(structualItemInfo, index);
	};

	render() {
		const { targetList, maxCount } = this.props;

		let previewerClass =
			targetList.length > 0 ? ModuleStyle['show-preview'] : '';

		// let imageUrl = targetList.length > 0 ? targetList[0].targetImageUrl : '';
		return (
			<div className={ModuleStyle['search-target-panel']}>
				<div
					className={`${
						ModuleStyle['search-target-drop-preview']
					} ${previewerClass}`}
				>
					{targetList.length > 0 &&
						targetList.map((item, index) => {
							return (
								<div
									key={item.uuid + index + `${targetList.length}`}
									className={ModuleStyle['preview']}
								>
									<Popover
										placement="rightTop"
										trigger="hover"
										content={
											<div
												className={
													item.targetType === ETargetType.Face
														? ModuleStyle['search-target-face-hover']
														: item.targetType === ETargetType.Body
														? ModuleStyle['search-target-body-hover']
														: ModuleStyle['search-target-other-hover']
												}
											>
												<img height="100%" src={item.targetImageUrl} alt="" />
											</div>
										}
									>
										<StructuralItem
											className={`${ModuleStyle['structural-item-img']} `}
											structuralItemInfo={item}
											key={guid()} // 重新生成
											deletable={this.props.deletable}
											onDelete={this.onDelete.bind(this, item, index)}
											thumbFlag={
												item.targetType === ETargetType.Face
													? EThumbFlag.Thumb100x100
													: EThumbFlag.Thumb140x280
											}
										>
											{this.props.children}
										</StructuralItem>
									</Popover>
								</div>
							);
						})}
					{targetList.length < maxCount && (
						<DroppableArea
							className={`${ModuleStyle['drop-area']}`}
							onDragEnter={this.onDragEnter}
							onDragLeave={this.onDragLeave}
							onDropFiles={this.dropFiles}
							onDrop={this.onDrop}
							onClick={this.handleClickUpload}
						>
							{/* <Icon type="area-chart" /> */}
							<span className={ModuleStyle['camera-icon']} />
							{targetList.length < 3 && (
								<div className={`${ModuleStyle['select-tip']}`}>
									{intl.get('SEARCH_TARGET_PANEL_UPLOAD_TIP').d('上传/拖拽')}
								</div>
							)}
						</DroppableArea>
					)}
				</div>
			</div>
		);
	}
}

export default SearchTargetPanel;
