import * as React from 'react';
import ModuleStyle from './index.module.scss';
import DroppableArea from 'ifvendors/droppable-area';
import * as intl from 'react-intl-universal';
import { IFStructuralInfo } from 'stsrc/type-define';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	onQuickSearch: (structuralInfo: IFStructuralInfo) => void;
};

class QuickSearchPanel extends STComponent<PropsType> {
	static defaultProps = {
		onQuickSearch: () => {}
	};

	onDrop = (structuralInfo: IFStructuralInfo) => {
		this.props.onQuickSearch(structuralInfo);
	};

	render() {
		return (
			<DroppableArea
				className={ModuleStyle['quick-search-panel']}
				onDrop={this.onDrop}
			>
				<span className={ModuleStyle['camera-icon']} />
				<div className={ModuleStyle['tip']}>
					{intl.get('QUICK_SEARCH_PANEL_TIP').d('图片拖放到这里')}
				</div>
				<div className={ModuleStyle['filter-layer']} />
			</DroppableArea>
		);
	}
}

export default QuickSearchPanel;
