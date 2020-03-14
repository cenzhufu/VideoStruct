import * as React from 'react';
import { IRoleInfo } from 'stsrc/utils/requests/user-auth-requests/role/role-type';
import { Modal, message } from 'antd';
import ModuleStyle from './index.module.scss';
import * as ReactDOM from 'react-dom';
import { CascaderOptionType } from 'antd/lib/cascader';
import AuthorityEditPanel from '../authority-edit-panel';
import { RoleRequest } from 'stutils/requests/user-auth-requests/role';
import { IBModuleTreeNode } from 'stutils/requests/user-auth-requests/module/module-type';
import STComponent from 'stcomponents/st-component';
export enum Mode {
	Add = 'add',
	Edit = 'edit'
}

function noop() {}

type PropsType = {
	roleInfo?: IRoleInfo;
	orginationId: string; // 组织id
	organization: string; // 组织名
	mode: Mode;
	title: string | React.ReactNode;
	visible: boolean;
	onCancel: () => void;
	onOk: (name: string, orginatinId: string, moduleIds: Array<string>) => void;
	needCheckAuthorityName: boolean;
};

type StateType = {
	cacsaderOptions: Array<CascaderOptionType>;
	authorityModule: Array<IBModuleTreeNode>;
};

class AuthorityEditModalContainer extends STComponent<PropsType, StateType> {
	static defaultProps = {
		visible: false,
		title: '',
		orginationId: '',
		onCancel: noop,
		onOk: noop
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {
			cacsaderOptions: [],
			authorityModule: []
		};
	}

	static show(props: Partial<PropsType> = { visible: true }) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let element = (
			// @ts-ignore
			<AuthorityEditModalContainer {...{ ...props, visible: true }} />
		);

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	componentDidMount() {
		//查看角色模块权限
		RoleRequest.searchRoleAuthority()
			.then((list: Array<IBModuleTreeNode>) => {
				console.log('propslist', list);
				this.setState({
					authorityModule: list
				});
			})
			.catch((err) => {
				console.log('err', err);
				message.error(err.message);
			});
	}

	onCancel = () => {
		this.props.onCancel();
	};

	onOk = (name: string, moduleIds: Array<string>, roleId: string) => {
		this.props.onOk(name, roleId, moduleIds);
	};

	render() {
		return (
			<Modal
				className={ModuleStyle['module-group-setting']}
				title={this.props.title}
				visible={this.props.visible}
				onCancel={this.onCancel}
				footer={null}
				maskClosable={false}
				centered={true}
				closable={false}
				width={600}
			>
				<AuthorityEditPanel
					authorityModuleList={this.state.authorityModule}
					onCancel={this.props.onCancel}
					onOk={this.onOk}
					roleInfo={this.props.roleInfo}
					needCheckAuthorityName={this.props.needCheckAuthorityName}
				/>
			</Modal>
		);
	}
}

export default AuthorityEditModalContainer;
