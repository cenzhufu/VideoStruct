import * as React from 'react';
import STComponent from 'stsrc/components/st-component';

import ModuleStyles from './index.module.scss';
import { IFActionAlarmInfo } from 'stsrc/utils/mqtt';
import ImageView, { ImageDisplayMode } from 'ifvendors/image-view';
import { EActionMonitorType } from 'stsrc/utils/requests/monitor-request/src/action-monitor/types';
import * as moment from 'moment';
import { Icon } from 'antd';
import * as intl from 'react-intl-universal';

import { ReactComponent as NameIcon } from './assets/images/name.svg';

type PropsType = {
	monitorInfo: IFActionAlarmInfo;

	className: string;
	style: React.CSSProperties;
};

class MonitorInfoPanel extends STComponent<PropsType> {
	static defaultProps = {
		className: '',
		style: {},
		cameraInfo: null
	};

	onClick = () => {};

	getTypeTip() {
		switch (this.props.monitorInfo.type) {
			case EActionMonitorType.Ride: {
				return intl.get('MONITOR_INFO_RIDE').d('骑行');
			}

			case EActionMonitorType.ManyPeople: {
				return intl.get('MONITOR_INFO_MANY_PEOPLE').d('密集人群');
			}

			case EActionMonitorType.FallOver: {
				return intl.get('MONITOR_INFO_FALL_OVER').d('跌倒');
			}

			case EActionMonitorType.Disorder: {
				return intl.get('MONITOR_INFO_DISORDER').d('骚乱');
			}

			default:
				return '';
		}
	}

	getTime() {
		return moment(this.props.monitorInfo.time).format('YYYY-MM-DD HH:mm:ss');
	}

	getCameraName() {
		return (
			(this.props.monitorInfo &&
				this.props.monitorInfo.cameraInfo &&
				this.props.monitorInfo.cameraInfo.name) ||
			''
		);
	}

	render() {
		return (
			<li className={ModuleStyles['monitor-info-item']} onClick={this.onClick}>
				<div className={ModuleStyles['image-outer-container']}>
					<div className={ModuleStyles['image-container']}>
						<ImageView
							imageUrl={this.props.monitorInfo.url}
							displayMode={ImageDisplayMode.AutoOrginOrAscpectFit}
						/>
					</div>
				</div>

				{this.props.monitorInfo.isNewMessage && (
					<span className={ModuleStyles['tip']}>新</span>
				)}

				<div className={ModuleStyles['right-monitorList-footer']}>
					<span className={ModuleStyles['type-tip']}>{this.getTypeTip()}</span>
					<div className={ModuleStyles['tips']}>
						<div className={ModuleStyles['time-tip']}>
							<Icon type="clock-circle" className={ModuleStyles['time-icon']} />
							<div title={this.getTime()} className={ModuleStyles['time']}>
								{this.getTime()}
							</div>
						</div>
						<div
							className={ModuleStyles['name-tip']}
							title={this.getCameraName()}
						>
							{
								<Icon
									className={ModuleStyles['name-icon']}
									component={NameIcon}
								/>
							}
							<div className={ModuleStyles['name']}>{this.getCameraName()}</div>
						</div>
					</div>
				</div>
			</li>
		);
	}
}

export default MonitorInfoPanel;
