import * as React from 'react';
import STComponent from 'stsrc/components/st-component';
import ModuleStyle from './assets/styles/index.module.scss';
import Swiper from 'swiper/dist/js/swiper.js';
import 'swiper/dist/css/swiper.min.css';
import * as intl from 'react-intl-universal';
import StructuralSpinner from 'stsrc/components/spinner';
// import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

interface PropsType<T> {
	className?: string;
	style: React.CSSProperties;
	resultInfos: Array<T>;
	hasMore: boolean;
	showLoading: boolean;
	getMoreScrollData: () => void;
	renderItem: (item: T, index: number) => React.ReactNode;
	getKey: (item: T, index: number) => string;
}

interface StateType {}

function noop() {}

class StructuralScroll<T> extends STComponent<PropsType<T>, StateType> {
	static defaultProps = {
		renderItem: noop,
		style: {},
		getMoreScrollData: noop,
		getKey: (item, index: number) => index,
		resultInfos: []
	};
	swiper: Swiper | null;

	// 此方法是为了在新插入数据，数据过多时，div有确定的宽度而不会导致页面被撑开
	onResize = () => {
		if (this.swiper) {
			this.swiper.update();
		}
	};
	componentDidMount() {
		const that = this;
		const swiper = new Swiper('.swiper-container', {
			direction: 'horizontal',
			slidesPerView: 'auto',
			spaceBetween: 10,
			freeMode: true,
			observer: true,
			observeParents: true,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev'
			},
			mousewheel: true,
			loop: false,
			on: {
				slideChange: function() {
					// 无法检测到滚动到最后一个的activeIndex，先用加10处理
					if (
						this.activeIndex + 10 >= that.props.resultInfos.length &&
						that.props.hasMore
					) {
						that.props.getMoreScrollData();
					}
				}
			}
		});
		this.swiper = swiper;
		this.onResize();
		window.addEventListener('resize', this.onResize);
	}

	render() {
		const { className, showLoading } = this.props;

		return (
			<div
				className={`${ModuleStyle['structural-scroll-container']} ${className}`}
				style={this.props.style}
			>
				<div
					className={ModuleStyle['prev-btn-container']}
					onClick={() => {
						this.swiper.slidePrev();
					}}
				>
					<i className={ModuleStyle['prev-btn']} />
				</div>
				<div
					className={`swiper-container ${
						ModuleStyle['custom-swiper-container']
					}`}
				>
					{this.props.resultInfos.length ? (
						<div className="swiper-wrapper">
							{/* <ReactCSSTransitionGroup
								component="div"
								className="swiper-wrapper"
								transitionLeave={false}
								transitionEnterTimeout={500}
								transitionName={{
									enter: ModuleStyle['rotate-in-ver'],
									// enterActive: ModuleStyle['enterActive'],
									leave: ''
								}}
							> */}
							{this.props.resultInfos.map((item: T, index: number) => {
								return (
									<div
										className={`${ModuleStyle['custom-slide']} swiper-slide`}
										// style={{ width: 160 }}
										key={this.props.getKey(item, index)}
									>
										{this.props.renderItem(item, index)}
									</div>
								);
							})}
							{/* </ReactCSSTransitionGroup> */}
						</div>
					) : (
						<div className="swiper-wrapper">
							{showLoading ? (
								<div className={ModuleStyle['spinner-wrapper']}>
									<StructuralSpinner />
								</div>
							) : (
								<div className={ModuleStyle['no-data-container']}>
									{intl.get('SCROLL_NO_DATA').d('暂无数据')}
								</div>
							)}
						</div>
					)}
				</div>
				<div
					className={ModuleStyle['next-btn-container']}
					onClick={() => {
						this.swiper.slideNext();
					}}
				>
					<i className={ModuleStyle['next-btn']} />
				</div>
				{this.props.showLoading ? (
					<div className={ModuleStyle['spinner-wrapper']}>
						<StructuralSpinner />
					</div>
				) : null}
			</div>
		);
	}
}

export default StructuralScroll;
