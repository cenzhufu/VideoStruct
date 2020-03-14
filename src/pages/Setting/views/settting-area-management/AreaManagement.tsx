import * as React from 'react';
import { message, Icon, Button, Input } from 'antd';
import * as intl from 'react-intl-universal';
import {
	AreaRequests,
	AddAreaRequestPayloadType
} from 'stsrc/utils/requests/basic-server-request';
import StyleSheets from './assets/index.module.scss';
import { IFAreaInfo } from 'sttypedefine';
import TreeStructure from 'stsrc/components/tree-structure-component';
import STComponent from 'stcomponents/st-component';
import Config from 'stconfig';
import AddOrEditAreaDialog from './AddOrEditAreaDialog';

interface PropsType {}

interface StateType {
	searchStr: string;
	areaTreeData: Array<IFAreaInfo>;
}
class AreaManagement extends STComponent<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = {
			searchStr: '',
			areaTreeData: []
		};
	}
	componentDidMount() {
		//获取区域树
		this.getAreaTree();
	}

	getAreaTree = (searchStr?: string) => {
		//获取区域树
		AreaRequests.getAreaTree(searchStr)
			.then((list: IFAreaInfo[]) => {
				this.setState({
					areaTreeData: list // this.filterAreaTree(list)
				});
				if (list && list.length > 0) {
					//
				} else {
					message.error(intl.get('empty-data').d('暂无数据'));
				}
			})
			.catch((error: Error) => {
				console.error(error);
				message.error(error.message);
			});
	};

	addAreaInfo = (name: string, parentId: string, description: string) => {
		let payload: AddAreaRequestPayloadType = {
			name: name,
			parentId: parentId,
			description: description
		};
		if (this.areasNameCheck(payload.name)) {
			AreaRequests.addArea(payload)
				.then((res) => {
					message.success(intl.get('AREA_ADD_SUCCESS').d('添加区域成功！'));
					this.getAreaTree();
				})
				.catch((error: Error) => {
					console.log('err', error);
					message.error(error.message);
				});
		}
	};

	//编辑区域:接口不一致，parentId传空
	editAreaInfo = (
		id: string,
		parentId: string,
		name: string,
		description: string
	) => {
		let payload = {
			name: name,
			id: id,
			parentId: parentId,
			description: description
		};
		if (this.areasNameCheck(name)) {
			AreaRequests.modifyArea(payload)
				.then((res) => {
					message.success(intl.get('AREA_EDIT_SUCCESS').d('修改区域成功！'));
					this.getAreaTree();
				})
				.catch((error: Error) => {
					console.log('err', error);
					message.error(error.message);
				});
		}
	};

	//删除区域
	deleteAreaInfo = (id: string) => {
		let payload = {
			areaId: id
		};
		AreaRequests.deleteArea(payload)
			.then((res) => {
				message.success(intl.get('AREA_DELETE_SUCCESS').d('删除区域成功！'));
				this.getAreaTree();
			})
			.catch((error: Error) => {
				console.log('err', error);
				message.error(error.message);
			});
	};

	searchStrOnPressEnter = (str: string) => {
		this.getAreaTree(str);
	};

	/**
	 * 限制area的层级
	 * @param {Array<IFAreaInfo>} areaList 原始数据
	 * @param {number} maxLevel 最大层级
	 * @returns {Array<IFOrganizationTree>}  格式化数据
	 */
	filterAreaTree = (
		areaList: IFAreaInfo[] = [],
		maxLevel = Config.getAreaLevels()
	) => {
		let areaDataList: Array<IFAreaInfo> = [];
		for (let area of areaList) {
			let tempArea = { ...area };
			if (area.level < maxLevel) {
				tempArea['children'] = this.filterAreaTree(area.children, maxLevel);
			} else {
				// 太多的层级不显示了
				tempArea['children'] = [];
			}

			areaDataList.push(tempArea);
		}
		return areaDataList;
	};

	//输入字符串长度校验
	areasNameCheck = (value: string) => {
		if (value && value.length > 10) {
			message.error(
				intl
					.get('AUTHORITY_MANAGEMENT_MODALADD_TITLE')
					.d('请输入不超过10位字符')
			);
			return false;
		} else {
			return true;
		}
	};

	onClickDetail(item: IFAreaInfo) {
		console.log('on click detail', item);
	}

	onClickDelete(item: IFAreaInfo) {
		console.log('on click delete', item);
		this.deleteAreaInfo(item.id);
	}

	onClickEdit(item: IFAreaInfo) {
		let handle = AddOrEditAreaDialog.show({
			title: intl.get('ddddddddddddd').d('编辑区域'),
			allAreaInfos: this.filterAreaTree(
				this.state.areaTreeData,
				Config.getAreaLevels() - 1
			),
			areaInfo: item,
			onCancel: () => {
				handle.destory();
			},
			onOk: (
				areaName: string,
				id?: string,
				parentId?: string,
				description?: string
			) => {
				this.editAreaInfo(
					id as string,
					parentId || '0',
					areaName,
					description || ''
				);
				handle.destory();
			}
		});
	}

	onAddArea = () => {
		let handle = AddOrEditAreaDialog.show({
			title: intl.get('ddddddddddddd').d('新增区域'),
			allAreaInfos: this.filterAreaTree(
				this.state.areaTreeData,
				Config.getAreaLevels() - 1
			),
			onCancel: () => {
				handle.destory();
			},
			onOk: (
				areaName: string,
				id?: string,
				parentId?: string,
				description?: string
			) => {
				// 创建区域
				this.addAreaInfo(areaName, parentId || '0', description || '');
				handle.destory();
			}
		});
	};

	onSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
		this.getAreaTree(event.currentTarget.value);
	};

	renderPopover = (item: IFAreaInfo) => {
		return (
			<div className={StyleSheets['popover-sheet']}>
				<div
					className={StyleSheets['popover-sheet-item']}
					onClick={() => {
						this.onClickEdit(item);
					}}
				>
					<Icon type="form" className={StyleSheets['icon']} />
					{intl.get('wwwwwwwwwwwwww').d('编辑')}
				</div>
				<div
					className={StyleSheets['popover-sheet-item']}
					onClick={() => {
						this.onClickDelete(item);
					}}
				>
					<Icon type="delete" className={StyleSheets['icon']} />
					{intl.get('wwwwwwwwwwwwww').d('删除')}
				</div>
			</div>
		);
	};

	render() {
		const { areaTreeData } = this.state;

		return (
			<div className={StyleSheets['area-management-container']}>
				<Button type="primary" icon="plus-circle" onClick={this.onAddArea}>
					{intl.get('ddddddddddddd').d('新增区域')}
				</Button>
				<Input
					className={StyleSheets['search-inpu']}
					prefix={<Icon type="search" />}
					onPressEnter={this.onSearch}
					placeholder={intl
						.get('2222222222222222333')
						.d('输入区域名称并回车搜索')}
				/>
				<div className={StyleSheets['area-management-tree']}>
					{
						<TreeStructure<IFAreaInfo>
							treeList={this.filterAreaTree(areaTreeData)}
							renderPopover={this.renderPopover}
						/>
					}
				</div>
			</div>
		);
	}
}

export default AreaManagement;
