import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import { Modal, Input, Cascader, Button } from 'antd';
import * as ReactDOM from 'react-dom';
import { IFOrganizationTree } from 'stsrc/type-define';
import { CascaderOptionType } from 'antd/lib/cascader';
import ModuleStyle from './assets/styles/edit-organization-dialog.module.scss';
import * as intl from 'react-intl-universal';
interface PropsType {
	onCancel: () => void;
	onOk: (
		name: string,
		id?: string,
		parentId?: string,
		description?: string
	) => void;
	visible: boolean;
	afterClose: () => void;
	title: string;

	organizationInfo?: IFOrganizationTree;
	organizationTreeList: IFOrganizationTree[];
}

interface StateType {
	nameDraft: string;
	parentIdDraft?: string;
	descriptionDraft?: string;
	idPaths: string[];
}

function noop() {}

class AddOrEditOrganizationDialog extends STComponent<PropsType, StateType> {
	static defaultProps = {
		visible: false,
		onCancel: noop,
		onOk: noop,
		afterClose: noop,
		organizationTreeList: [],
		title: '',
		idPaths: []
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {
			nameDraft: this.props.organizationInfo
				? this.props.organizationInfo.name
				: '',
			parentIdDraft: this.props.organizationInfo
				? this.props.organizationInfo.parentId
				: undefined,
			descriptionDraft: this.props.organizationInfo
				? this.props.organizationInfo.description
				: '',
			idPaths: this.props.organizationInfo
				? this.getIdPath(
						this.props.organizationInfo.parentId,
						this.props.organizationTreeList
				  )
				: []
		};

		// 生成map
	}

	static show(props: Partial<PropsType>) {
		let container = document.createElement('div');
		document.body.appendChild(container);
		let element = <AddOrEditOrganizationDialog {...props} visible={true} />;

		ReactDOM.render(element, container);
		return {
			destory: function destory() {
				function afterClose() {
					ReactDOM.unmountComponentAtNode(container);
					container.remove();
				}
				let element = (
					<AddOrEditOrganizationDialog
						visible={false}
						afterClose={afterClose}
					/>
				);
				ReactDOM.render(element, container);
			},
			update: function update(newProps: Partial<PropsType>) {
				let mergedProps = {
					...props,
					...newProps
				};
				let newElement = <AddOrEditOrganizationDialog {...mergedProps} />;
				ReactDOM.render(newElement, container);
			}
		};
	}

	getIdPath(id: string, extendAreaList: IFOrganizationTree[]): string[] {
		for (let root of extendAreaList) {
			let result = this._getIdPath(id, root, []);
			if (result.length > 0) {
				return result;
			}
		}

		return [];
	}

	_getIdPath(
		id: string,
		root: IFOrganizationTree,
		paths: string[] = []
	): string[] {
		if (!id) {
			return [];
		}

		// eslint-disable-next-line
		if (root.id == id) {
			return [...paths, id];
		}

		for (let child of root.children) {
			let result = this._getIdPath(id, child, [...paths, root.id]);
			if (result.length > 0) {
				return result;
			}

			continue;
		}

		return [];
	}

	canContinue() {
		return !!this.state.nameDraft;
	}

	onCancel = () => {
		this.props.onCancel();
	};

	onOk = () => {
		if (this.canContinue()) {
			this.props.onOk(
				this.state.nameDraft,
				this.props.organizationInfo
					? this.props.organizationInfo.id
					: undefined,
				this.state.idPaths.length > 0
					? this.state.idPaths[this.state.idPaths.length - 1]
					: undefined,
				this.state.descriptionDraft
			);
		}
	};

	onSelecetArea = (value: string[], selectedOptions?: CascaderOptionType[]) => {
		this.setState({
			parentIdDraft: value[value.length - 1],
			idPaths: value
		});
	};

	changeAreaToCascadeOption(
		area: IFOrganizationTree,
		ignore: IFOrganizationTree | null = null
	): CascaderOptionType {
		let result = {
			value: area.id,
			label: area.name,
			// eslint-disable-next-line
			disabled: ignore != null && ignore.id == area.id
		};

		if (area.children.length > 0) {
			result['children'] = area.children.map((child: IFOrganizationTree) => {
				return this.changeAreaToCascadeOption(child, ignore);
			});
		}

		return result;
	}

	onChangeDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({
			descriptionDraft: event.target.value
		});
	};

	onChangeAreaName = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			nameDraft: event.target.value
		});
	};

	render() {
		let footer = (
			<div>
				<Button onClick={this.onCancel}>
					{intl.get('ddd11111').d('取消')}
				</Button>
				<Button
					type="primary"
					disabled={!this.canContinue()}
					onClick={this.onOk}
				>
					{intl.get('ddd').d('确定')}
				</Button>
			</div>
		);

		return (
			<Modal
				destroyOnClose={true}
				maskClosable={false}
				afterClose={this.props.afterClose}
				title={this.props.title}
				wrapClassName={ModuleStyle['edit-area-dialog']}
				visible={this.props.visible}
				onCancel={this.onCancel}
				footer={footer}
			>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title']}>单位名称</div>
					<Input
						maxLength={10}
						className={ModuleStyle['item-value ']}
						placeholder={'(必填)请输入区域名称'}
						value={this.state.nameDraft}
						onChange={this.onChangeAreaName}
					/>
				</div>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title']}>所属单位</div>
					<Cascader
						changeOnSelect={true}
						value={this.state.idPaths}
						className={ModuleStyle['cascader-area']}
						popupClassName={ModuleStyle['popover-cascader-area']}
						expandTrigger="hover"
						notFoundContent="没有找到该单位"
						placeholder="请选择所属单位"
						showSearch={true}
						options={this.props.organizationTreeList.map(
							(organizationInfo: IFOrganizationTree) => {
								return this.changeAreaToCascadeOption(
									organizationInfo,
									this.props.organizationInfo
								);
							}
						)}
						onChange={this.onSelecetArea}
					/>
				</div>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title-description']}>单位描述</div>
					<Input.TextArea
						placeholder="请输入单位描述"
						value={this.state.descriptionDraft}
						onChange={this.onChangeDescription}
						maxLength={1000}
						autosize={{ minRows: 6, maxRows: 6 }}
					/>
				</div>
			</Modal>
		);
	}
}

export default AddOrEditOrganizationDialog;
