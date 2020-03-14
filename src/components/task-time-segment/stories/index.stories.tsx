import * as React from 'react';
import { storiesOf } from '@storybook/react';

import StructuralTaskTimeSegment from '../src/StructuralTaskTimeSegment';

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
		'http://192.168.11.147:8889/group1/M00/3D/3B/wKgLk1x8ni-AK-RzAAQYyLsa8Pk565.jpg',
	originalImageWidth: 1920,
	orignialImageId: '946047781948242',
	sourceId: '549',
	sourceType: ESourceType.Camera,
	targetImageUrl:
		'http://192.168.11.147:8889/group1/M00/3D/3B/wKgLk1x8ni-AI5mhAAAif-_HFZ8055.jpg',
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

storiesOf('StructuralInfo Scroll', module).add(
	'地图底部轮播item时间显示',
	() => {
		return <StructuralTaskTimeSegment taskTime={structuralInfo.time} />;
	}
);
