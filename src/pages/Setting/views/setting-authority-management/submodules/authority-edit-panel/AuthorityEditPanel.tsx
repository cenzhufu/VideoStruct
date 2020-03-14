import * as React from 'react';
import ModuleStyle from './index.module.scss';
import * as intl from 'react-intl-universal';
import { Input, Button, Checkbox } from 'antd';
import { RoleRequest } from 'stsrc/utils/requests/user-auth-requests/role';
import {
	IBModuleTreeNode,
	EModuleGroupType
} from 'stutils/requests/user-auth-requests/module/module-type';
import { IRoleInfo } from 'stsrc/utils/requests/user-auth-requests/role/role-type';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import STComponent from 'stcomponents/st-component';
import { ValidateTool } from 'ifvendors/utils/validate-tool';
type PropsType = {
	onOk: (name: string, moduleIds: Array<string>, roleId: string) => void;
	onCancel: () => void;
	authorityModuleList: Array<IBModuleTreeNode>;
	roleInfo?: IRoleInfo;
	needCheckAuthorityName?: boolean;
};

type StateType = {
	authorityName: string;
	checkIn: boolean;
	ifSubmit: boolean;
	formatCheck: boolean;
	nullFormatCheck: boolean;
	selectedModuleIds: Array<string>;
};
// 实时告警隐藏
export enum instantAlarm {
	Name = '实时告警'
}
function noop() {}
class AuthorityEditPanel extends STComponent<PropsType, StateType> {
	static defaultProps = {
		onOk: noop,
		onCancel: noop,
		authorityModuleList: [],
		needCheckAuthorityName: true
	};

	constructor(props: PropsType) {
		super(props);

		let selectedList: Array<string> = [];
		if (props.roleInfo) {
			selectedList = props.roleInfo.moduleNames.reduce(
				(result: Array<string>, item: IBModuleTreeNode) => {
					// 便利child
					let childList = ValidateTool.getValidArray(item.childList);
					let childResult: Array<string> = childList.reduce(
						(previousValue: Array<string>, childItem: IBModuleTreeNode) => {
							previousValue.push(childItem.id);
							return previousValue;
						},
						[]
					);

					result.push(...childResult);

					return result;
				},
				[]
			);
		}
		this.state = {
			authorityName: props.roleInfo ? props.roleInfo.name : '',
			checkIn: false,
			ifSubmit: true,
			formatCheck: false,
			nullFormatCheck: false,
			selectedModuleIds: selectedList
		};
	}

	inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			authorityName: e.target.value.trim()
		});
	};
	inputOnBlur = () => {
		//验证权限名称长度
		if (this.state.authorityName && this.state.authorityName.length > 10) {
			this.setState({ formatCheck: true });
		} else {
			this.setState({ formatCheck: false });
		}

		if (
			this.state.authorityName.length === 0 ||
			this.state.authorityName === ' ' ||
			this.state.authorityName === null
		) {
			this.setState({ nullFormatCheck: true });
			this.canGoOn();
		} else {
			this.setState({ nullFormatCheck: false });
		}

		//验证权限名称重复
		if (
			this.state.authorityName &&
			this.state.authorityName.length <= 10 &&
			this.props.needCheckAuthorityName
		) {
			RoleRequest.searchAuthorityName(this.state.authorityName)
				.then((res) => {
					this.setState({
						ifSubmit: true,
						checkIn: true
					});
				})
				.catch((err) => {
					console.log('err', err);
					// message.error(err.message);
					this.setState({
						ifSubmit: false,
						checkIn: true
					});
				});
		} else {
			this.setState({
				ifSubmit: false,
				checkIn: false
			});
		}
	};

	onOk = () => {
		this.props.onOk(
			this.state.authorityName,
			this.state.selectedModuleIds,
			(this.props.roleInfo && this.props.roleInfo.id) || ''
		);
	};

	onCancel = () => {
		this.props.onCancel();
	};

	_findDataViewModuleId(): string | null {
		for (let moduleInfo of this.props.authorityModuleList) {
			//
			let value: string | null = this._findModuleInTree(
				EModuleGroupType.DataView_View,
				moduleInfo
			);
			if (value) {
				return value;
			}
		}

		return null;
	}

	_findDataAccessModuleId(): string | null {
		for (let moduleInfo of this.props.authorityModuleList) {
			//
			let value: string | null = this._findModuleInTree(
				EModuleGroupType.DataView_Access,
				moduleInfo
			);
			if (value) {
				return value;
			}
		}

		return null;
	}

	_findModuleInTree(
		resourceCode: EModuleGroupType,
		moduleInfo: IBModuleTreeNode
	): string | null {
		if (resourceCode && moduleInfo) {
			// eslint-disable-next-line
			if (moduleInfo.resourceCode == resourceCode) {
				return moduleInfo.id || '';
			}

			// 递归子树
			let children: Array<IBModuleTreeNode> = moduleInfo.childList || [];
			for (let child of children) {
				let value = this._findModuleInTree(resourceCode, child);
				// eslint-disable-next-line
				if (value) {
					return value;
				}
			}

			return null;
		} else {
			return null;
		}
	}

	onChange = (e: CheckboxChangeEvent) => {
		let value = e.target.value as IBModuleTreeNode;
		if (e.target.checked) {
			// 选中
			// 是否是摄像头管理
			let dataAccessId: string | null = null;
			if (value.resourceCode === EModuleGroupType.AdvancedSetting_Camera) {
				dataAccessId = this._findDataAccessModuleId();
			}

			// 判断是否数据接入
			let dataViewId: string | null = null;
			if (
				value.resourceCode === EModuleGroupType.DataView_Access ||
				value.resourceCode === EModuleGroupType.AdvancedSetting_Camera
			) {
				// 同时选中数据查看
				// 找到数据查看的id
				dataViewId = this._findDataViewModuleId(); //现在不要同时选中数据查看了
			}
			if (this.state.selectedModuleIds.indexOf(value.id) === -1) {
				this.setState((prevState: StateType) => {
					return {
						selectedModuleIds: [...prevState.selectedModuleIds, value.id]
					};
				});
			}

			if (
				dataViewId &&
				this.state.selectedModuleIds.indexOf(dataViewId) === -1
			) {
				// @ts-ignore
				this.setState((prevState: StateType) => {
					return {
						selectedModuleIds: [...prevState.selectedModuleIds, dataViewId]
					};
				});
			}

			if (
				dataAccessId &&
				this.state.selectedModuleIds.indexOf(dataAccessId) === -1
			) {
				// @ts-ignore
				this.setState((prevState: StateType) => {
					return {
						selectedModuleIds: [...prevState.selectedModuleIds, dataAccessId]
					};
				});
			}
		} else {
			let index = this.state.selectedModuleIds.indexOf(value.id);
			if (index !== -1) {
				this.setState((prevState: StateType) => {
					let copy: Array<string> = [...prevState.selectedModuleIds];
					copy.splice(index, 1);
					return {
						selectedModuleIds: copy
					};
				});
			}
		}
	};

	canGoOn(): boolean {
		return !(
			this.state.authorityName !== '' && this.state.selectedModuleIds.length > 0
		);
	}

	render() {
		return (
			<div
				key="authorityModal"
				className={ModuleStyle['authority-module-container']}
			>
				<div className={ModuleStyle['authority-module-item']}>
					<span className={ModuleStyle['module-group--tip']}>
						{intl.get('AUTHORITY_MANAGEMENT_MODALTIP1').d('权限名称')}
					</span>
					<div className={ModuleStyle['input-name']}>
						<Input
							placeholder={intl
								.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
								.d('请输入不超过10位字符')}
							value={this.state.authorityName}
							onChange={this.inputOnChange}
							onBlur={this.inputOnBlur}
							maxLength={50}
							pattern={'/^[a-zA-Z\u2E80-\u9FFF]+$/'}
							formNoValidate={false}
						/>
						{this.state.formatCheck && (
							<span style={{ color: '	#ff0000' }}>
								{intl
									.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
									.d('请输入不超过10位字符')}
							</span>
						)}
						{this.state.nullFormatCheck && (
							<span style={{ color: '	#ff0000' }}>
								{intl
									.get('AUTHORITY_MANAGEMENT_MdODALADD_TITLE_NULL_MESSAGE')
									.d('新增权限名称不能为空')}
							</span>
						)}
						{this.state.checkIn ? (
							<div className={ModuleStyle['varify-tip']}>
								<span
									style={{ color: this.state.ifSubmit ? '#1890ff' : '#ff0000' }}
								>
									{this.state.ifSubmit
										? intl
												.get('AUTHORITY_MANAGEMENT_MODALTIP1_CHECKINPUT1')
												.d('权限名称可用')
										: intl
												.get('AUTHORITY_MANAGEMENT_MODALTIP1_CHECKINPUT2')
												.d('权限名称重复')}
								</span>
							</div>
						) : (
							''
						)}
					</div>
				</div>

				{this.props.authorityModuleList.map((item: IBModuleTreeNode) => {
					if (
						item.childList &&
						item.childList.length > 0 &&
						item.name !== instantAlarm.Name
					) {
						return (
							<div className={ModuleStyle['module-group']} key={item.id}>
								<div className={ModuleStyle['module-group--tip']}>
									{item.name}
								</div>
								<div className={ModuleStyle['module-item-list']}>
									{// NOTE: 只取一层
									item.childList.map((childItem: IBModuleTreeNode) => {
										return (
											<Checkbox
												onChange={this.onChange}
												key={childItem.id}
												className={ModuleStyle['module-item']}
												value={childItem}
												checked={this._isSelected(childItem.id)}
											>
												{childItem.name}
											</Checkbox>
										);
									})}
								</div>
							</div>
						);
					}
					return null;
				})}
				<div className={ModuleStyle['authority-module-btn']}>
					<Button style={{ marginRight: 10 }} onClick={this.onCancel}>
						{intl.get('CANCLE_BTN').d('取消')}
					</Button>
					<Button type="primary" onClick={this.onOk} disabled={this.canGoOn()}>
						{intl.get('SURE_BTN').d('确定')}
					</Button>
				</div>
			</div>
		);
	}

	_isSelected(id: string, list: Array<string> = this.state.selectedModuleIds) {
		return list.indexOf(id) !== -1;
	}
}

export default AuthorityEditPanel;
