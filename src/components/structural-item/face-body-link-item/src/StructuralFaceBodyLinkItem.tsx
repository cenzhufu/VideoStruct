import StructuralInfoTipSegements from 'stsrc/components/structural-info-segements';
// import { Icon } from 'antd';
import STComponent from 'stsrc/components/st-component';
import { ETaskType, DateFormat } from 'stsrc/type-define';
import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import FacePlaceholder from './assets/imgs/face.png';
import BodyPlaceholder from './assets/imgs/body.png';
import Link from './assets/imgs/link.png';

import {
	IFStructuralInfo,
	ETargetType,
	IFStructuralLinkInfo
} from 'sttypedefine';
import StructuralItemFace from '../../face/src/StructuralFace';
import StructuralItemBody from '../../body';
import * as moment from 'moment';
import { ImageDisplayMode } from 'ifvendors/image-view';
interface PropsType {
	structuralLinkInfo: IFStructuralLinkInfo;
	structuralItemInfo: IFStructuralInfo;
	searchType: ETargetType; //关联搜索类型
	onClick: (
		structuralLinkInfo: IFStructuralInfo,
		event: React.SyntheticEvent<HTMLDivElement>
	) => void; // 点击事件

	className: string;
	style: Object;
	taskType: ETaskType; // 任务类型
	taskTime: typeof DateFormat; // 任务的时间戳
	threshold: number; // 相似度
	bodyOption: ETargetType.Face | ETargetType.Body; // 判断人脸或身体再前的展示
}

function noop() {}

class StructuralFaceBodyLinkItem extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		draggableData: {},
		searchType: ETargetType.Face,
		onClick: noop,
		threshold: 0,
		taskTime: moment().format(DateFormat),
		bodyOption: ETargetType.Face // 哪个显示在前面，当为face时，face在前，为body时body在前
	};
	render() {
		const {
			structuralLinkInfo,
			onClick,
			style,
			className,
			bodyOption
		} = this.props;
		return (
			<div
				className={`${ModuleStyle['link-container']} ${className}`}
				style={style}
			>
				<div className={ModuleStyle['face-body-container-box']}>
					{bodyOption === ETargetType.Face ? (
						<div className={ModuleStyle['face-body-container']}>
							{structuralLinkInfo.face ? (
								<StructuralItemFace
									displayMode={ImageDisplayMode.ScaleAspectFit}
									style={{ marginRight: '0', marginBottom: '0' }}
									structuralItemInfo={structuralLinkInfo.face}
									draggableData={structuralLinkInfo.face}
									clickable={true}
									onClick={onClick}
								/>
							) : (
								<div className={ModuleStyle['face-Placeholder']}>
									<img
										src={FacePlaceholder}
										height={'100%'}
										width={'100%'}
										alt=""
									/>
								</div>
							)}
							<div className={ModuleStyle['link-symbol']}>
								<img src={Link} height={'16pz'} width={'8px'} alt="加载失败" />
							</div>
							{structuralLinkInfo.body ? (
								<StructuralItemBody
									displayMode={ImageDisplayMode.ScaleAspectFit}
									style={{ marginRight: '0', marginBottom: '0' }}
									structuralItemInfo={structuralLinkInfo.body}
									draggableData={structuralLinkInfo.body}
									clickable={true}
									onClick={onClick}
								/>
							) : (
								<div className={ModuleStyle['body-Placeholder']}>
									<img
										src={BodyPlaceholder}
										height={'100%'}
										width={'100%'}
										alt=""
									/>
								</div>
							)}
						</div>
					) : (
						<div className={ModuleStyle['face-body-container']}>
							{structuralLinkInfo.body ? (
								<StructuralItemBody
									displayMode={ImageDisplayMode.ScaleAspectFit}
									style={{ marginRight: '0', marginBottom: '0' }}
									structuralItemInfo={structuralLinkInfo.body}
									draggableData={structuralLinkInfo.body}
									clickable={true}
									onClick={onClick}
								/>
							) : (
								<div className={ModuleStyle['body-Placeholder']}>
									<img
										src={BodyPlaceholder}
										height={'100%'}
										width={'100%'}
										alt=""
									/>
								</div>
							)}
							<div className={ModuleStyle['link-symbol']}>
								<img src={Link} height={'16pz'} width={'8px'} alt="加载失败" />
							</div>
							{structuralLinkInfo.face ? (
								<StructuralItemFace
									displayMode={ImageDisplayMode.ScaleAspectFit}
									style={{ marginRight: '0', marginBottom: '0' }}
									structuralItemInfo={structuralLinkInfo.face}
									draggableData={structuralLinkInfo.face}
									clickable={true}
									onClick={onClick}
								/>
							) : (
								<div className={ModuleStyle['face-Placeholder']}>
									<img
										src={FacePlaceholder}
										height={'100%'}
										width={'100%'}
										alt=""
									/>
								</div>
							)}
						</div>
					)}

					<StructuralInfoTipSegements
						className={ModuleStyle['face-body-tip']}
						taskType={this.props.taskType}
						threshold={
							this.props.structuralItemInfo.threshold
								? this.props.structuralItemInfo.threshold
								: this.props.threshold
						}
						taskTime={this.props.taskTime}
					/>
				</div>
			</div>
		);
	}
}

export default StructuralFaceBodyLinkItem;
