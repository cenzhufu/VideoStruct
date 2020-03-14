import * as React from 'react';
import { storiesOf } from '@storybook/react';

import StructuralInfoTipSegements from '../src/StructuralInfoTipSegements';
import {
	ETaskType,
	IFStructuralInfo,
	ESourceType,
	ETargetType
} from 'stsrc/type-define';

// Demo数据
let structuralInfo: IFStructuralInfo = {
	attributeProperties: [],
	guid: '946047781948262',
	id: '946047781948262',
	originalImageHeight: 1080,
	originalImageUrl:
		'http://127.0.0.1:8889/group1/M00/3D/3B/wKgLk1x8ni-AK-RzAAQYyLsa8Pk565.jpg',
	originalImageWidth: 1920,
	orignialImageId: '946047781948242',
	sourceId: '549',
	sourceType: ESourceType.Camera,
	targetImageUrl:
		'http://127.0.0.1:8889/group1/M00/3D/3B/wKgLk1x8ni-AI5mhAAAif-_HFZ8055.jpg',
	targetRegionInOriginal: {
		bottom: 1,
		left: 0,
		right: 1,
		top: 0
	},
	targetType: ETargetType.Body,
	taskType: ETaskType.AnalysisTask,
	threshold: 0,
	time: '2019-03-04 11:40:00',
	uuid: '5c7c9e2f4621880037e5b90b'
};

storiesOf('StructuralInfoTipSegements', module).add('采集', () => {
	return (
		<StructuralInfoTipSegements
			taskTime={structuralInfo.time}
			taskType={structuralInfo.taskType}
		/>
	);
});
