import * as React from 'react';
import ModuleStyle from './assets/styles/target-tabs-style.module.scss';
import { ETargetType } from 'stsrc/type-define';
import classnames from 'classnames';

interface ITab {
	displayName: string;
	targetType: ETargetType;
}

interface PropsType {
	tabs: ITab[];
	current: ETargetType;
	onChangeTab: (targetType: ETargetType) => void;
}

class TargetTabs extends React.Component<PropsType> {
	static defaultProps = {
		onChangeTab: () => {}
	};
	onChangeTab = (item: ITab) => {
		console.log('clicked', item);
		this.props.onChangeTab(item.targetType);
	};

	render() {
		return (
			<div className={ModuleStyle['tabs']}>
				{this.props.tabs.map((item: ITab) => {
					let className = classnames({
						[ModuleStyle['item']]: true,
						[ModuleStyle['selected']]: this.props.current === item.targetType
					});
					return (
						<div
							key={item.targetType + '___key'}
							className={className}
							onClick={() => {
								this.onChangeTab(item);
							}}
						>
							{item.displayName}
						</div>
					);
				})}
			</div>
		);
	}
}

export default TargetTabs;
