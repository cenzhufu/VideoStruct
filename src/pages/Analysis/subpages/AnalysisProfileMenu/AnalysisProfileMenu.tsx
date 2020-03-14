import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import STComponent from 'stcomponents/st-component';
import * as intl from 'react-intl-universal';
import { Menu, Icon } from 'antd';
import { ESourceType } from 'sttypedefine';
import { EAnalysisSourceStatus } from 'stutils/requests/collection-request';

export interface MenuCountType {
	type?: ESourceType;
	status?: EAnalysisSourceStatus;
	count: number;
}
interface ProptsType {
	className: string;
	style: Object;
	onClick: (activeKey: string) => void;
	menuCountData: MenuCountType[];
}

function none() {}
class AnalysisProfileMenu extends STComponent<ProptsType> {
	static defaultProps = {
		className: '',
		style: {},
		onClick: none,
		menuCountData: []
	};

	handleClick = (e) => {
		if (this.props.onClick) {
			this.props.onClick(e.key);
		}
	};

	/**
	 * 获取统计数量结果
	 * @param {(ESourceType | EAnalysisSourceStatus)} type  type
	 * @returns {number} count
	 */
	_getCount = (type: ESourceType | EAnalysisSourceStatus) => {
		let count: number = 0;
		const { menuCountData } = this.props;
		for (const item of menuCountData) {
			if (item.type && item.type === type) {
				count = item.count;
			} else if (item.status && item.status === type) {
				count = item.count;
			}
		}

		return count;
	};

	render() {
		const { className, style } = this.props;

		return (
			<div
				className={`${ModuleStyle['datasource-menu-container']} ${className}`}
				style={style}
			>
				<div className={ModuleStyle['datasource-menu-title']}>
					<div className={ModuleStyle['datasource-menu-title-icon']} />
					<div>{intl.get('--').d('资源库')} </div>
				</div>
				<Menu
					defaultSelectedKeys={[String(EAnalysisSourceStatus.Analysising)]}
					// defaultOpenKeys={['sub1']}
					mode="inline"
					theme="dark"
					onClick={this.handleClick}
					// inlineCollapsed={this.state.collapsed}
				>
					<Menu.Item key={EAnalysisSourceStatus.Analysising}>
						<Icon type="pie-chart" />
						<span className={ModuleStyle['datasource-menu-name']}>
							{intl.get('--').d('正在解析')}{' '}
						</span>
						<span className={ModuleStyle['datasource-menu-total']}>
							{this._getCount(EAnalysisSourceStatus.Analysising)}
						</span>
					</Menu.Item>
					<Menu.Item key={ESourceType.Camera}>
						<Icon type="pie-chart" />
						<span className={ModuleStyle['datasource-menu-name']}>
							{intl.get('COMMON_SOURCE_TYPE_REALTIME_VIDEO').d('实时视频')}{' '}
						</span>
						<span className={ModuleStyle['datasource-menu-total']}>
							{this._getCount(ESourceType.Camera)}
						</span>
					</Menu.Item>
					<Menu.Item key={ESourceType.Video}>
						<Icon type="pie-chart" />
						<span className={ModuleStyle['datasource-menu-name']}>
							{intl.get('COMMON_SOURCE_TYPE_OFFLINE_VIDEO').d('离线视频')}{' '}
						</span>
						<span className={ModuleStyle['datasource-menu-total']}>
							{this._getCount(ESourceType.Video)}
						</span>
					</Menu.Item>
					<Menu.Item key={ESourceType.Zip}>
						<Icon type="pie-chart" />
						<span className={ModuleStyle['datasource-menu-name']}>
							{intl.get('COMMON_SOURCE_TYPE_BATCH_IMAGES').d('批量图片')}{' '}
						</span>
						<span className={ModuleStyle['datasource-menu-total']}>
							{this._getCount(ESourceType.Zip)}
						</span>
					</Menu.Item>
				</Menu>
			</div>
		);
	}
}

export default AnalysisProfileMenu;
