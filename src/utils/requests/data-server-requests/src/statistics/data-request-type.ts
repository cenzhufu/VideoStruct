/**
 * 统计的item结构
 * 当统计项为组合统计时，使用#拼接，此时统计项的值也使用#拼接
 * @export
 * @interface IStatisticItemInfo
 */
export interface IStatisticItemInfo {
	date: string; // 统计的时间区间
	statisticalValue: string; // 统计项的值 1#2 // 组合的值
	statisticalResult: number; // 统计项的统计值 // 具体的数值
	statisticalItem: string; // 统计项 , 如 gender#age
}
