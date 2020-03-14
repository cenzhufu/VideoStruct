import STComponent from 'stsrc/components/st-component';
import * as React from 'react';
import * as moment from 'moment';
import { DateFormat } from 'stsrc/type-define';
import ModuleStyle from './assets/styles/index.module.scss';

interface PropsType {
	style: React.CSSProperties;
	taskTime: string; // 时间
}

class StructuralTaskTimeSegment extends STComponent<PropsType> {
	render() {
		const { taskTime } = this.props;
		return (
			<div
				className={ModuleStyle['task-time-segment']}
				style={this.props.style}
			>
				<span>
					<i className={ModuleStyle['task-time-icon']} />
					{taskTime ? moment(taskTime).format(DateFormat) : ''}
				</span>
			</div>
		);
	}
}

export default StructuralTaskTimeSegment;
