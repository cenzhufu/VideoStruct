import STPureComponent from 'stsrc/components/st-component';
import { ETaskType, DateFormat } from 'stsrc/type-define';
// import Segments from 'ifvendors/segments';
import * as React from 'react';
import ModuleStyle from './assets/styles/index.module.scss';
import * as intl from 'react-intl-universal';
// import * as moment from 'moment';

interface PropsType {
	className: string;
	style: React.CSSProperties;

	taskType: ETaskType; // 任务类型
	taskTime: typeof DateFormat; // 任务的时间戳
	threshold: number; // 相似度
}

class StructuralInfoTipSegements extends STPureComponent<PropsType> {
	static defaultProps = {
		className: '',
		style: {},

		threshold: 0
	};

	render() {
		let addClassName: string = '';
		let localeKey: string = 'unknown';
		switch (this.props.taskType) {
			case ETaskType.AnalysisTask:
				addClassName = ModuleStyle['analysis'];
				localeKey = 'STRUCTURAL_INFO_TASK_TYPE_ANALYSIS';
				break;

			case ETaskType.CaptureTask:
				addClassName = ModuleStyle['capture'];
				localeKey = 'STRUCTURAL_INFO_TASK_TYPE_CAPTURE';

				break;

			default:
				break;
		}

		return (
			<div
				className={`${this.props.className} ${
					ModuleStyle['structural-item-segment']
				} ${addClassName}`}
				style={this.props.style}
			>
				{this.props.threshold ? (
					<span className={ModuleStyle['first-segment']}>
						{this.formatThreshold()}
					</span>
				) : (
					<span className={ModuleStyle['first-segment']}>
						{intl.get(localeKey)}
					</span>
				)}
				<span className={ModuleStyle['second-segment']}>
					{this.formatTime()}
				</span>
			</div>
		);
	}

	formatTime(): string {
		// let delta = moment().diff(moment(this.props.taskTime));
		let nowTime = new Date().getTime();
		let creatTime = new Date(this.props.taskTime).getTime();
		let timeDifference = nowTime - creatTime;
		// if (delta < 0) {
		// 	return intl.get('STRUCTURAL_INFO_TIME_TIP_NOW').d('刚刚');
		// }

		// delta = delta / 1000; // ms -> s;

		const MINITE = 60 * 1000;
		const HOUR = 60 * MINITE;
		const DAY = 24 * HOUR;
		const WEEk = 7 * DAY;
		const MONTH = 4 * WEEk;
		const YEAR = 12 * MONTH;
		// 分钟
		if (timeDifference < MINITE) {
			// let seconde = Number.parseInt(String(delta), 10);
			// return intl
			// 	.get('STRUCTURAL_INFO_TIME_TIP_SECOND', { second: seconde })
			// 	.d(`${seconde}秒`);
			// return intl
			// 	.get('STRUCTURAL_INFO_TIME_TIP_MINITE', { minite: 1 })
			// 	.d(`${1}分钟前`);
			return intl.get('STRUCTURAL_INFO_TIME_TIP_NOW').d('0分钟');
		} else if (timeDifference < HOUR) {
			let minite = Math.floor(timeDifference / MINITE);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_MINITE', { minite: minite })
				.d(`${minite}分钟前`);
		} else if (timeDifference < DAY) {
			let hour = Math.floor(timeDifference / HOUR);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_HOUR', { hour: hour })
				.d(`${hour}时`);
		} else if (timeDifference < WEEk) {
			let day = Math.floor(timeDifference / DAY);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_DAY', { day: day })
				.d(`${day}天`);
		} else if (timeDifference < MONTH) {
			let week = Math.floor(timeDifference / WEEk);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_WEEK', { week: week })
				.d(`${week}个星期`);
		} else if (timeDifference < YEAR) {
			let month = Math.floor(timeDifference / MONTH);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_MONTH', { month: month })
				.d(`${month}个月`);
		} else {
			let year = Math.floor(timeDifference / YEAR);
			return intl
				.get('STRUCTURAL_INFO_TIME_TIP_YEAR', { year: year })
				.d(`${year}年`);
		}
	}

	formatTaskType(): string {
		let localeKey: string = 'unknown';
		switch (this.props.taskType) {
			case ETaskType.AnalysisTask:
				localeKey = 'STRUCTURAL_INFO_TASK_TYPE_CAPTURE';
				break;

			case ETaskType.CaptureTask:
				localeKey = 'STRUCTURAL_INFO_TASK_TYPE_ANALYSIS';
				break;

			default:
				break;
		}

		if (localeKey) {
			return intl.get(localeKey);
		} else {
			return '';
		}
	}

	formatThreshold(): string {
		return String(this.props.threshold + '%');
	}
}

export default StructuralInfoTipSegements;
