import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ModalModuleStyle from './assets/styles/index.module.scss';
import { Modal, Button } from 'antd';
import * as intl from 'react-intl-universal';
import WarningIconComponent from '../icons/warning-icon';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	showAuthorityModal: boolean;
	onOk: () => void;
};

type StateType = {};
function noop() {}
class AuthorityHint extends STComponent<PropsType, StateType> {
	static defaultProps = {
		showAuthorityModal: false,
		onOk: noop
	};

	constructor(props: PropsType, state: StateType) {
		super(props);
	}

	static show(props: Partial<PropsType>) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let element = <AuthorityHint {...props} />;

		ReactDOM.render(element, container);

		return {
			destory: function destory() {
				ReactDOM.unmountComponentAtNode(container);
				container.remove();
			}
		};
	}

	render() {
		return (
			<div className={ModalModuleStyle['authority-modal-block']}>
				<Modal
					className={ModalModuleStyle['authority-modal-info']}
					visible={this.props.showAuthorityModal}
					centered={true}
					closable={false}
					footer={
						<span>
							{
								<Button type={'primary'} onClick={this.props.onOk}>
									{intl.get('intl.AUTHORITY_HINT_BUTTON_TEXT').d('知道了')}
								</Button>
							}
						</span>
					}
				>
					{this.props.showAuthorityModal && (
						<div>
							<span className={`${ModalModuleStyle['warning-title-block']}`}>
								{<WarningIconComponent />}
								<span className={`${ModalModuleStyle['warning-title-info']}`}>
									{intl
										.get('intl.AUTHORITY_HINT_INFO_TITLE')
										.d('你没有操作/访问权限')}
								</span>
							</span>

							<span className={`${ModalModuleStyle['warning-title-message']}`}>
								{intl
									.get('intl.AUTHORITY_HINT_INFO_MESSAGE')
									.d('请联系超级管理员开通权限')}
							</span>
						</div>
					)}
				</Modal>
			</div>
		);
	}
}

export default AuthorityHint;
