import * as React from 'react';

type PropsType = {
	placeholder: React.ReactNode;
	children: React.ReactNode;
	className: string;
};

type StateType = {
	visible: boolean;
};

class LazyLoad extends React.Component<PropsType, StateType> {
	static defaultProps = {
		placeholder: null,
		children: null,
		className: ''
	};

	rootRef: React.RefObject<HTMLDivElement>;
	observer: IntersectionObserver;

	constructor(props: PropsType) {
		super(props);
		this.state = {
			visible: false
		};

		this.rootRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount() {
		if (this.rootRef.current) {
			this.startListener(this.rootRef.current);
		}
	}

	componentWillUnmount() {
		if (this.rootRef.current) {
			this.stopListerner(this.rootRef.current);
		}

		if (this.observer) {
			this.observer.disconnect();
		}
	}

	startListener(target: Element) {
		this.observer = new IntersectionObserver(this.listenerCallback, {
			rootMargin: '200px 200px 200px 200px'
		});
		this.observer.observe(target);
	}

	stopListerner(target: Element) {
		this.observer.unobserve(target);
	}

	listenerCallback = (
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver
	) => {
		entries.forEach((item: IntersectionObserverEntry) => {
			if (item.isIntersecting) {
				this.setState({
					visible: true
				});
				// once
				observer.unobserve(item.target);
				observer.disconnect();
			}
		});
	};

	render() {
		return this.state.visible ? (
			this.props.children
		) : (
			<div ref={this.rootRef} className={this.props.className}>
				{this.props.placeholder}
			</div>
		);
	}
}

export default LazyLoad;
