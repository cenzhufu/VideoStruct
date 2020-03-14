import ThrottlePool from '../src';

let throttlePool = new ThrottlePool();
// 数据
let dataList: Array<any> = [];

beforeAll(() => {
	for (let i = 0; i < 1000; i++) {
		dataList.push(`${i}`);
	}

	throttlePool.adjustFlowSpeed(10, 1);
	throttlePool.adjustCapability(10);
});

it('正常流速', (done) => {
	throttlePool.startFlowManage();
	// 输入数据
	setInterval(() => {
		if (dataList.length === 0) {
			done();
		}

		let addDataList = dataList.splice(0, Math.min(10, dataList.length));
		throttlePool.inflow(addDataList);
	}, 1000);

	// 输出
	throttlePool.outflow((data: Array<any>) => {
		console.log('输出', data);
	});
});
