import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import { Modal, Input, Cascader, Button } from 'antd';
import ModuleStyle from './assets/edit-dialog.module.scss';
import * as ReactDOM from 'react-dom';
import { IFAreaInfo } from 'stsrc/type-define';
import { CascaderOptionType } from 'antd/lib/cascader';
import * as intl from 'react-intl-universal';
interface PropsType {
	onCancel: () => void;
	onOk: (
		areaName: string,
		id?: string,
		parentId?: string,
		description?: string
	) => void;
	visible: boolean;
	afterClose: () => void;
	title: string;

	areaInfo?: IFAreaInfo;
	allAreaInfos: IFAreaInfo[];
}

interface StateType {
	areaNameDraft: string;
	parentIdDraft?: string;
	areaDescriptionDraft?: string;
	idPaths: string[];
}

function noop() {}

class AddOrEditAreaDialog extends STComponent<PropsType, StateType> {
	static defaultProps = {
		visible: false,
		onCancel: noop,
		onOk: noop,
		afterClose: noop,
		allAreaInfos: [],
		title: '',
		idPaths: []
	};

	constructor(props: PropsType) {
		super(props);

		this.state = {
			areaNameDraft: this.props.areaInfo ? this.props.areaInfo.name : '',
			parentIdDraft: this.props.areaInfo
				? this.props.areaInfo.parentId
				: undefined,
			areaDescriptionDraft: this.props.areaInfo
				? this.props.areaInfo.description
				: '',
			idPaths: this.props.areaInfo
				? this.getIdPath(this.props.areaInfo.parentId, this.props.allAreaInfos)
				: []
		};

		// 生成map
	}

	static show(props: Partial<PropsType>) {
		let container = document.createElement('div');
		document.body.appendChild(container);
		let element = <AddOrEditAreaDialog {...props} visible={true} />;

		ReactDOM.render(element, container);
		return {
			destory: function destory() {
				function afterClose() {
					ReactDOM.unmountComponentAtNode(container);
					container.remove();
				}
				let element = (
					<AddOrEditAreaDialog visible={false} afterClose={afterClose} />
				);
				ReactDOM.render(element, container);
			},
			update: function update(newProps: Partial<PropsType>) {
				let mergedProps = {
					...props,
					...newProps
				};
				let newElement = <AddOrEditAreaDialog {...mergedProps} />;
				ReactDOM.render(newElement, container);
			}
		};
	}

	getIdPath(id: string, extendAreaList: IFAreaInfo[]): string[] {
		for (let root of extendAreaList) {
			let result = this._getIdPath(id, root, []);
			if (result.length > 0) {
				return result;
			}
		}

		return [];
	}

	_getIdPath(id: string, root: IFAreaInfo, paths: string[] = []): string[] {
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
		return !!this.state.areaNameDraft;
	}

	onCancel = () => {
		this.props.onCancel();
	};

	onOk = () => {
		if (this.canContinue()) {
			this.props.onOk(
				this.state.areaNameDraft,
				this.props.areaInfo ? this.props.areaInfo.id : undefined,
				this.state.idPaths.length > 0
					? this.state.idPaths[this.state.idPaths.length - 1]
					: undefined,
				this.state.areaDescriptionDraft
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
		area: IFAreaInfo,
		ignore: IFAreaInfo | null = null
	): CascaderOptionType {
		let result = {
			value: area.id,
			label: area.name,
			// eslint-disable-next-line
			disabled: ignore != null && ignore.id == area.id
		};

		if (area.children.length > 0) {
			result['children'] = area.children.map((child: IFAreaInfo) => {
				return this.changeAreaToCascadeOption(child);
			});
		}

		return result;
	}

	onChangeDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({
			areaDescriptionDraft: event.target.value
		});
	};

	onChangeAreaName = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			areaNameDraft: event.target.value
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
				footer={footer}
				onCancel={this.onCancel}
			>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title']}>区域名称</div>
					<Input
						maxLength={10}
						className={ModuleStyle['item-value ']}
						placeholder={'(必填)请输入区域名称'}
						value={this.state.areaNameDraft}
						onChange={this.onChangeAreaName}
					/>
				</div>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title']}>所属区域</div>
					<Cascader
						changeOnSelect={true}
						value={this.state.idPaths}
						className={ModuleStyle['cascader-area']}
						popupClassName={ModuleStyle['popover-cascader-area']}
						expandTrigger="hover"
						notFoundContent="没有找到该区域"
						placeholder="请选择所属区域"
						showSearch={true}
						options={this.props.allAreaInfos.map((areaInfo: IFAreaInfo) => {
							return this.changeAreaToCascadeOption(areaInfo);
						})}
						onChange={this.onSelecetArea}
					/>
				</div>
				<div className={ModuleStyle['item']}>
					<div className={ModuleStyle['item-title-description']}>区域描述</div>
					<Input.TextArea
						placeholder="请输入区域描述"
						value={this.state.areaDescriptionDraft}
						onChange={this.onChangeDescription}
						maxLength={1000}
						autosize={{ minRows: 6, maxRows: 6 }}
					/>
				</div>
			</Modal>
		);
	}
}

export default AddOrEditAreaDialog;
