import * as React from 'react';
import { storiesOf } from '@storybook/react';

import StructuralFace from '../src/StructuralFace';

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
		'http://192.168.11.147:8889/group1/M00/3D/40/wKgLk1x8rH2Aakq8AAR99ouirAA390.jpg',
	originalImageWidth: 1920,
	orignialImageId: '946047781948242',
	sourceId: '549',
	sourceType: ESourceType.Camera,
	targetImageUrl:
		'http://192.168.11.147:8889/group1/M00/3D/40/wKgLk1x8rH2AEbXcAAAkY2XO6wg263.jpg',
	targetRegionInOriginal: {
		bottom: 1,
		left: 0,
		right: 1,
		top: 0
	},
	targetType: ETargetType.Face,
	taskType: ETaskType.AnalysisTask,
	threshold: 0,
	time: '2019-03-04 11:40:00',
	uuid: '5c7c9e2f4621880037e5b90b'
};

storiesOf('StructuralInfo Face', module).add('人脸', () => {
	return <StructuralFace structuralItemInfo={structuralInfo} />;
});
