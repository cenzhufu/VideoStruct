import * as React from 'react';
import ModuleStyle from './assets/styles/time-style.module.scss';
import * as moment from 'moment';

interface TimeProps {
	time: number;
	className: string;
}

interface StateType {
	timeNow: number;
}

class Time extends React.PureComponent<TimeProps, StateType> {
	static defaultProps = {
		time: Date.now()
	};

	timer: number | undefined;
	state = {
		timeNow: this.props.time
	};

	componentDidMount() {
		this.startTimer();
	}

	componentWillUnmount() {
		this.endTimer();
	}

	startTimer() {
		this.endTimer();
		this.timer = window.setInterval(() => {
			this.setState((prevState: StateType) => {
				return {
					timeNow: prevState.timeNow + 1 * 1000
				};
			});
		}, 1 * 1000);
	}

	endTimer() {
		if (this.timer) {
			window.clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	render() {
		let time = moment(this.state.timeNow);
		return (
			<div className={this.props.className}>
				<div className={ModuleStyle['date']}>
					{time.format('YYYY-MM-DD dddd')}
				</div>
				<div className={ModuleStyle['time']}>{time.format('HH:mm:ss')}</div>
			</div>
		);
	}
}

export default Time;
