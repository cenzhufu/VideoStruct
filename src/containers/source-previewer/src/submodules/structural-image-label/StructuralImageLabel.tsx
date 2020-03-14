import * as React from 'react';
import STComponent from 'stcomponents/st-component';
import ModuleStyle from './index.module.scss';
import { IFStructuralInfo, ETargetType } from 'stsrc/type-define';

type PropsType = {
	// style?: React.CSSProperties;
	structuralInfo: IFStructuralInfo;

	offsetX: number;
	offsetY: number;
};

class StructuralImageLabel extends STComponent<PropsType> {
	static defaultProps = {
		style: {},
		offsetX: 0,
		offsetY: 0
	};

	render() {
		let style = {};
		let item = this.props.structuralInfo;
		if (item.targetRegionInOriginal) {
			if (item.targetType === ETargetType.Body) {
				// 标记的尺寸
				style = {
					position: 'absolute',
					borderColor: '#0046ff',
					left: `calc(${100 * item.targetRegionInOriginal.left}% + ${
						this.props.offsetX
					}px)`,
					top: `calc(${100 * item.targetRegionInOriginal.top}% + ${
						this.props.offsetY
					}px)`,
					right: `calc(${100 * (1 - item.targetRegionInOriginal.right)}% - ${
						this.props.offsetX
					}px)`,
					bottom: `calc(${100 * (1 - item.targetRegionInOriginal.bottom)}% - ${
						this.props.offsetY
					}px)`
				};
			} else {
				style = {
					position: 'absolute',
					left: `${100 * item.targetRegionInOriginal.left}%`,
					top: `${100 * item.targetRegionInOriginal.top}%`,
					right: `${100 * (1 - item.targetRegionInOriginal.right)}%`,
					bottom: `${100 * (1 - item.targetRegionInOriginal.bottom)}%`
				};
			}
		}
		return (
			<div className={ModuleStyle['structural-image-label']} style={style} />
		);
	}
}

export default StructuralImageLabel;
