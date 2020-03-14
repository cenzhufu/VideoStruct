import * as React from 'react';

// import LazyLoadImageView from 'ifvendors/lazyload-imageview';
import ModuleStyle from './index.module.scss';
import ZipIconComponent from './submodules/zip-icon';
import STComponent from 'stcomponents/st-component';
type PropsType = {
	className: string;
	style: React.CSSProperties;
};
class AnalysisTaskResultMultiThumbnail extends STComponent<PropsType> {
	static defaultProps = {
		taskResultInfos: [],
		className: '',
		style: {}
	};

	render() {
		return (
			<div
				className={`${ModuleStyle['task-result-thumbnail']} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<ZipIconComponent />
			</div>
		);
	}
}

export default AnalysisTaskResultMultiThumbnail;
