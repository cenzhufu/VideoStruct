import * as React from 'react';
import { storiesOf } from '@storybook/react';

import StructuralItemBodyInteractive from '../src/StructuralItemBodyInteractive';

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

let isSelected: boolean = true;

const showBigPic = () => {
	console.log('查看大图function');
	isSelected = !isSelected;
};

const handleMouseEnter = () => {
	console.log('鼠标移入回调');
};

const handleMouseLeave = () => {
	console.log('鼠标移出回调');
};

const onImgSelect = (id: string) => {
	console.log(`id 为 ${id} 的图片被点击`);
};

storiesOf('StructuralInfo Body', module).add('人体可交互', () => {
	return (
		<StructuralItemBodyInteractive
			structuralItemInfo={structuralInfo}
			isSelected={isSelected}
			showBigPic={showBigPic}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onImgSelect={onImgSelect}
			size="big"
		/>
	);
});