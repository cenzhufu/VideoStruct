import * as React from 'react';
import { ECarLicenseColorValue, IFAttributeProperty } from 'stsrc/type-define';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';

interface PropsType {
	style: React.CSSProperties;
	className: string;

	licenseColor?: IFAttributeProperty;
	licenseNumber?: IFAttributeProperty;
}

class CarLicenseNumber extends React.PureComponent<PropsType> {
	static defaultProps = {
		style: {},
		className: '',

		licenseColor: null,
		licenseNumber: null
	};

	render() {
		let className = '';
		if (this.props.licenseColor) {
			switch (this.props.licenseColor.attributeValue) {
				case ECarLicenseColorValue.Yellow:
					className = ModuleStyle['yellow'];
					break;

				case ECarLicenseColorValue.Blue:
					className = ModuleStyle['blue'];
					break;

				case ECarLicenseColorValue.White:
					className = ModuleStyle['white'];
					break;

				case ECarLicenseColorValue.YellowGreen:
					className = ModuleStyle['yellow-green'];
					break;

				case ECarLicenseColorValue.GradientGreen:
					className = ModuleStyle['gradient-green'];
					break;

				case ECarLicenseColorValue.Green:
					className = ModuleStyle['green'];
					break;

				case ECarLicenseColorValue.Unknow:
					className = ModuleStyle['unknown'];
					break;

				default:
					break;
			}
		}

		let tip =
			(this.props.licenseNumber &&
				intl
					.get(this.props.licenseNumber.tipLabelKey)
					.d(this.props.licenseNumber.defaultTip)) ||
			'';
		return (
			<div
				className={`${ModuleStyle['license-number']} ${className} ${
					this.props.className
				}`}
				style={this.props.style}
			>
				<div className={ModuleStyle['border']} title={tip}>
					{tip}
				</div>
			</div>
		);
	}
}

export default CarLicenseNumber;
