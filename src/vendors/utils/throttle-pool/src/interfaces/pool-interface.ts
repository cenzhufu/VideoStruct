export type OutFlowCallBack = (data: any[]) => void;

export interface IFThrottlePoolInterface {
	inflow(data: any[]): void; // 将数据流入到pool中
	outflow(outflowcallback: OutFlowCallBack): void; // 数据流出的回调

	adjustFlowSpeed(outputCountPerTime: number, outputIntervalTime: number): void; // 调整流速(量， 时间)
	adjustCapability(capability: number): void; // 调整容量大小
	clearPool(): void; // 清空pool
}
