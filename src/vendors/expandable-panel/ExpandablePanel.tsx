import * as React from 'react';
import ModuleStyle from './index.module.scss';
import DomUtils from 'ifutils/dom-util';

type PropsType = {
	className: string;
	style: object;
	children: React.ReactNode;

	collapsedClassName: string;
	expandedClassName: string;

	expanded: boolean; // 是否展开的
};

type StateType = {
	height: string;
};

class ExpandablePanel extends React.Component<PropsType, StateType> {
	static defaultProps = {
		className: '',
		collapsedClassName: '',
		expandedClassName: '',
		style: {},
		expanded: false
	};

	expandRef: React.RefObject<HTMLDivElement>;
	constructor(props: PropsType) {
		super(props);
		this.expandRef = React.createRef<HTMLDivElement>();
		this.state = {
			height: ''
		};
	}

	onTransitionEnd = () => {
		// console.log('--------------end');
	};

	componentDidMount() {
		this.recalculate();
	}

	recalculate(cal: boolean = false) {
		if (this.expandRef.current) {
			let node = this.expandRef.current;
			if (this.props.expanded) {
				DomUtils.getDomTotalHeight(node, {
					callback: (height: number) => {
						this.setState({
							height: height + 1 + 'px'
						});
					},
					ignoreSelfStyle: true
				});
			} else {
				this.setState({
					height: node.clientHeight + 1 + 'px'
				});
			}
		}
	}

	render() {
		let currentClassName = '';
		if (this.props.expanded) {
			currentClassName = `${this.props.expandedClassName}`;
		} else {
			currentClassName = `${this.props.collapsedClassName}`;
		}

		let style = {};
		if (this.props.expanded) {
			style = {
				height: this.state.height
			};
		}
		return (
			<div
				ref={this.expandRef}
				className={`${ModuleStyle['expandable-panel']} ${
					this.props.className
				} ${currentClassName}`}
				style={{ ...this.props.style, ...style }}
				onTransitionEnd={this.onTransitionEnd}
			>
				{this.props.children}
			</div>
		);
	}
}

export default ExpandablePanel;
