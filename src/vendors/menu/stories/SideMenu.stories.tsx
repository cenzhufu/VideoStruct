import * as React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import SideMenu from '../index';
import ModuleStyle from './index.module.scss';
const Item = SideMenu.Item;

storiesOf('Welcome', module).add('to Storybook', () => (
	<Welcome showApp={linkTo('Button')} />
));

storiesOf('Button', module)
	.add('with text', () => {
		return <Button onClick={action('clicked')}> Hello Button </Button>;
	})
	.add('with some emoji', () => {
		return (
			<Button onClick={action('clicked')}>
				<span role="img"> 😀😎👍💯</span>{' '}
			</Button>
		);
	});

storiesOf('SideMenu', module).add('basic', () => {
	return (
		<SideMenu className={ModuleStyle['side-menu']} expandedKeys={['1']}>
			<Item title="第一个" uniqueKey="1">
				<div>
					145+年前(沈夜幼时)，沈父(前任大祭司)因担心其子沈夜太过孤独，从平民孩子中挑选了一人，制成傀儡，做为沈夜的玩伴。沈夜为她取名“华月”，并言华月就是正月，万象更新，正是好时节。因为大祭司之子的身份，沈夜唯一的朋友就是沧溟，然而那时沧溟已经罹患绝症。有段时间，沈夜每天都把自己关在密室中，试验那些神农留下的上古秘术，希望寻找治愈绝症的方法。
					镜花水月 镜花水月(7张)
					145年前(沈夜8-15岁，具体不明)，为了尝试借神血之力治疗沧溟，沈父提议将同样患病的沈夜和其妹妹小曦送入矩木核心做实验。沈夜试图带小曦逃跑，然而伏羲结界笼罩之下，最终还是被其父带回，送入了矩木。经此一事，沈夜和小曦的病症痊愈，沈夜还意外的获得了神血庇佑，然而小曦却再也未能长大，并且记忆只能维持三日。每过三日，她的记忆便退回被送入矩木之前的那一夜。由于神血效用未明，前任城主只将沧溟依附在矩木之上，借助神血之力控制病情。因沈夜获得部分神血之力护持，料想余生都不会再染上病症，虽然并不适合，但之后沈父仍将沈夜作为下一任大祭司训养。
					133年前，前任城主与前任大祭司先后亡故，沧溟继任城主，沈夜继任大祭司，流月城发生叛乱，沈夜暴力镇压。沈夜发觉他的病症并没有被神血治愈，但却隐瞒了这个事实。同年，沈夜收谢衣为徒，并将其作为下任大祭司培养。
					[3] 133-122年前，沈夜与谢衣合力尝试制作偃甲炉，以供寒冬时节族人取暖。
					122年前，谢衣成功破开伏羲结界。彼时，神血至多只能支持百年，五色石也行将燃尽，流月城面临覆亡危机。沈夜派遣祭司下界，找寻洞天福地或清气聚集之地，以供族人迁居。然而世殊时异，连洞天也已经多有浊气。同时，早已窥伺在旁的心魔砺罂趁破解之时潜入流月城，附上矩木，吸食城民七情。为了拯救族人，沈夜同砺罂谈判，最终达成协议，砺罂以其魔气熏染流月城民，使其能不惧浊气在下界生存。而作为交换，沈夜向下界投放矩木枝，助砺罂吸取下界七情以增强魔力。同时，沈夜与沧溟城主密谋，以沧溟的魂魄为代价施行冥蝶之印，用于最后封印心魔砺罂。此后122年间，沈夜每日都在砺罂面前给沧溟城主送花，并在花中暗暗附着灵力，以饲养冥蝶，增强唤醒冥蝶之印时的威力。
					同年，流月城几位高阶祭司叛乱，沈夜将叛乱祭司诛杀。不久之后，其徒破军祭司谢衣因反对与心魔合作，叛逃下界，另寻他法。沈夜下令，流月城中，从此不得再提破军祭司。
					100年前，沈夜于捐毒国附近沙海将谢衣捕获带回。谢衣重伤濒死，只得以偃甲和蛊虫续命，沈夜毁去其记忆，将其改名为初七，成为自己的专属部下。（此段内容为游戏沈夜自述“谢衣……百年之前，于捐毒国附近沙海之中，被本座捕获带回，本座毁去了他的记忆，仅保留下一部分法术和偃术……然后……本座给他改了名字，从头调教……”）
					22年前，沈夜派遣初七下界清理无厌伽蓝的妖灵，作为安置魔化城民的据点。
					17年前，沈夜向捐毒国投放矩木枝。
					游戏本传时间，沈夜于下界发现偃甲谢衣踪迹，并于捐毒国附近沙海找到偃甲谢衣，以叛师之名，斩下偃甲谢衣头颅，带回无厌伽蓝。沈夜读取偃甲谢衣的记忆，发现谢衣曾嘱咐乐无异等人寻找神剑昭明，可以之斩杀心魔砺罂，遂派遣初七下界跟踪主角团一行的进度，取回神剑昭明。
					游戏本传时间，贪狼祭司风琊发现矩木枝叶枯萎，派遣祭司在沈夜探望沧溟城主之时进入寂静之间进行试探。沈夜杀了进行试探的祭司，并因风琊存有二心，派遣初七除掉风琊。然而风琊此举，仍将矩木开始枯萎的事实暴露给了砺罂。砺罂遂施计趁沈夜不在时，骗取小曦的魔契石，使小曦失去抵御心魔的能力。
					因心魔已经有所察觉，沈夜开始令族民向下界龙兵屿迁徙。同时，向下界隐蔽的投放经过瞳改造的矩木枝，矩木枝上有咒印，只需念动咒诀，便能于瞬间截断它们与砺罂的联系。沈夜将以偃甲谢衣核心部件改造的偃甲刀“忘川”赠与初七，并命其于必要之时，可出手相助乐无异等人。
					广州之夜，初七替沈夜取回昭明剑身，沈夜带剑身回到流月城，以沧溟魂魄为祭，发动冥蝶之印，封印砺罂，并将神剑昭明插于矩木之上，阻断砺罂与矩木的联系。
					最终，乐无异一行人带着昭明剑心杀上流月城。城中只余不愿迁徙的族民和少部分祭司。乐无异等人强拔昭明剑身，导致砺罂破印而出，附在小曦身上。沈夜为杀砺罂，亲手破开小曦的胸膛，捏碎砺罂魔核，并令乐无异用重铸后的昭明斩断矩木。
					矩木断，流月城也将崩塌。沈夜为给下界修真门派一个交代，以身殉城。
				</div>
			</Item>
			<Item title="第二个">
				<div>
					我不觉得人的心智成熟是越来越宽容涵盖，什么都可以接受。相反，我觉得那应该是一个逐渐剔除的过程，知道自己最重要的是什么，知道不重要的东西是什么。而后，做一个纯简的人。
				</div>
			</Item>
			<Item title="第三个">
				<div>得友如你，是我三生有幸。</div>
			</Item>
			<Item title="第4个">
				<div />
			</Item>
		</SideMenu>
	);
});
