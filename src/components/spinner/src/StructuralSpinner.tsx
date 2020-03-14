import * as React from 'react';
import STComponent from 'stsrc/components/st-component';
import ModuleStyle from './assets/styles/index.module.scss';

interface PropsType {
	boxWidth?: string;
	bigBoxWidth?: string;
	colors?: string;
}

class StructuralSpinner extends STComponent<PropsType> {
	static defaultProps = {
		boxWidth: '10px',
		bigBoxWidth: '',
		colors: '#70b8f5'
	};
	render() {
		const { bigBoxWidth, boxWidth, colors } = this.props;
		return (
			<div className={ModuleStyle['spinner']} style={{ width: bigBoxWidth }}>
				<div
					className={ModuleStyle['bounce1']}
					style={{ backgroundColor: colors, width: boxWidth, height: boxWidth }}
				/>
				<div
					className={ModuleStyle['bounce2']}
					style={{ backgroundColor: colors, width: boxWidth, height: boxWidth }}
				/>
				<div
					className={ModuleStyle['bounce3']}
					style={{ backgroundColor: colors, width: boxWidth, height: boxWidth }}
				/>
			</div>
		);
	}
}

export default StructuralSpinner;
