import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ModalModuleStyle from './assets/styles/index.module.scss';
import { Modal, Checkbox } from 'antd';
import * as intl from 'react-intl-universal';
import WarningIconComponent from '../icons/warning-icon';
import STComponent from 'stcomponents/st-component';

type PropsType = {
	showConfirmModal: boolean;
	showCheckbox: boolean;
	onOk: () => void;
	onCancel: () => void;
	onChange: (e: any) => void;
	confirmTitle?: string;
};

type StateType = {};

function noop() {}
class DeleteConfirmModal extends STComponent<PropsType, StateType> {
	static defaultProps = {
		showConfirmModal: false,
		showCheckbox: false,
		onOk: noop,
		onCancel: noop,
		onChange: noop,
		confirmTitle: intl
			.get('intl.DATA_DELETE_CONFIRM_TITLE')
			.d('你确定要删除此条数据？')
	};

	static show(props: PropsType) {
		let container = document.createElement('div');
		document.body.appendChild(container);

		let element = <DeleteConfirmModal {...props} />;

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
			<div className={ModalModuleStyle['delete-modal-block']}>
				<Modal
					className={ModalModuleStyle['delete-modal-info']}
					visible={this.props.showConfirmModal}
					centered={true}
					closable={false}
					onOk={this.props.onOk}
					onCancel={this.props.onCancel}
					cancelText={intl.get('DELETE_COMFIRM_CANCEL').d('取消')}
					okText={intl.get('DELETE_COMFIRM_CONFIRM').d('确认')}
				>
					{this.props.showConfirmModal && [
						<span>
							{
								<WarningIconComponent
									className={ModalModuleStyle['info-icon']}
								/>
							}
							<span className={`${ModalModuleStyle['delete-title-info']}`}>
								{this.props.confirmTitle
									? this.props.confirmTitle
									: intl
											.get('intl.DATA_DELETE_CONFIRM_TITLE')
											.d('你确定要删除此条数据？')}
							</span>
						</span>,
						<div className={`${ModalModuleStyle['delete-title-message']}`}>
							{this.props.showCheckbox && (
								<span>
									{<Checkbox onChange={this.props.onChange} />}
									<span
										className={`${
											ModalModuleStyle['delete-title-message-text']
										}`}
									>
										{intl
											.get('intl.DATA_DELETE_CONFIRM_MESSAGE')
											.d('同时删除所有其他数据')}
									</span>
								</span>
							)}
						</div>
					]}
				</Modal>
			</div>
		);
	}
}

export default DeleteConfirmModal;
