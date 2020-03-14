import * as React from 'react';

export interface TableViewSectionDataSource {
	header?: (
		section: TableViewSectionDataSource,
		index: number
	) => React.ReactNode;
	footer?: (
		section: TableViewSectionDataSource,
		index: number
	) => React.ReactNode;
	items: Array<any>;
	renderItem: (item: any, index: number) => React.ReactNode;
}

interface TableViewPropsType {
	datasource: Array<TableViewSectionDataSource>;
	className: string;
	style: React.CSSProperties;
}

interface TableViewStateType {}

class TableView extends React.Component<
	TableViewPropsType,
	TableViewStateType
> {
	static defaultProps = {
		datasource: [],
		className: '',
		style: {}
	};

	private _headerRefs: Array<React.RefObject<HTMLLIElement>>;

	constructor(props: TableViewPropsType) {
		super(props);
		this._headerRefs = [];
	}

	scrollToSection(sectionIndex: number) {
		let ref: React.RefObject<HTMLLIElement> | null = this._headerRefs[
			sectionIndex
		];
		if (ref && ref.current) {
			ref.current.scrollIntoView({
				block: 'start',
				behavior: 'smooth'
			});
		}
	}

	_createRef(index: number): React.RefObject<HTMLLIElement> {
		let ref: React.RefObject<HTMLLIElement> = React.createRef<HTMLLIElement>();
		this._headerRefs[index] = ref;

		return ref;
	}

	_renderSection(
		section: TableViewSectionDataSource,
		index: number
	): React.ReactNode {
		let ref: React.RefObject<HTMLLIElement> = this._createRef(index);
		return (
			<li ref={ref} key={index}>
				{section.header && section.header(section, index)}
				{section.items.map((item: any, index: number) => {
					return section.renderItem(item, index);
				})}
				{section.footer && section.footer(section, index)}
			</li>
		);
	}

	render() {
		return (
			<ul className={this.props.className}>
				{this.props.datasource.map(
					(item: TableViewSectionDataSource, index: number) => {
						return this._renderSection(item, index);
					}
				)}
			</ul>
		);
	}
}

export default TableView;
