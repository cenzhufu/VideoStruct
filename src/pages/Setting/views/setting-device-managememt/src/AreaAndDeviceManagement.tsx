import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import { Tabs } from 'antd';
import AreaManagement from '../../settting-area-management';
import CamerasManagement from '../../setting-cameras-management';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';
import eventEmiiter, { EventType } from 'stsrc/utils/event-emit';
const TabPane = Tabs.TabPane;

class AreaAndDevicemanagement extends STComponent {
	onChange = (activeKey: string) => {
		if (activeKey === '2') {
			eventEmiiter.emit(EventType.changeToDeviceManageTab);
		}
	};

	render() {
		return (
			<Tabs
				defaultActiveKey="1"
				className={ModuleStyle['area-device-page']}
				animated={false}
				onChange={this.onChange}
			>
				<TabPane
					tab={intl.get('CAMERAS_MANAGEMENT_AREA').d('区域管理')}
					key="1"
				>
					<AreaManagement />
				</TabPane>
				<TabPane
					tab={intl.get('CAMERAS_MANAGEMENT_CAMERAS').d('设备管理')}
					key="2"
				>
					<CamerasManagement />
				</TabPane>
			</Tabs>
		);
	}
}

export default AreaAndDevicemanagement;
