import * as React from 'react';

interface PropType {
	index: Array<string>;
	onQuickIndexClick: (index: number, value: string) => void;

	className: string;
	style: React.CSSProperties;
}

function noop() {}

class QuickIndex extends React.PureComponent<PropType> {
	static defaultProps = {
		index: [],
		onQuickIndexClick: noop,

		className: '',
		style: {}
	};

	onClick = (event: React.MouseEvent<HTMLUListElement>) => {
		let element = event.currentTarget as HTMLElement; // ul
		let index = [].indexOf.call(element.childNodes, event.target);
		this.props.onQuickIndexClick(index, this.props.index[index]);
	};

	render() {
		return (
			<ul
				className={this.props.className}
				style={this.props.style}
				onClick={this.onClick}
			>
				{this.props.index.map((value: string, index: number) => {
					return <li key={index}>{value}</li>;
				})}
			</ul>
		);
	}
}

export default QuickIndex;
