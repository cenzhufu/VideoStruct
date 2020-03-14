export const EventType = {
	dragStart: 'dragStructuralStart',
	dragEnd: 'dragStraucturalEnd',

	draggedNewStrucutralItem: 'new-structural-info', // 拖拽了新的item(整个拖拽事件已经完成)

	addNewAnalysisSource: 'add-new-analysis-source', // 新增分析数据源

	previewerJumpMapPoint: 'previewer-jump-map-point', // 地图转跳

	deleteAnalysisingSource: 'delete-analysing-source', // 删除正在分析的数据源

	logout: 'log-out-event', // 登出事件
	logIn: 'log-in-event', // 登录事件
	getUserInfo: 'get-user-info-event', // 获得用户详情

	activeAnalysisInfoTask: 'active-analysis-info-task-event', // 激活分析任务更新的逻辑
	disactiveAnalysisInfoTask: 'disactive-analysis-info-task-event', // 取消分析任务更新的逻辑

	changeToQuickSearchTabIfNeeded: 'change-to-quick-search-if-needed', // 切换到快速搜索栏(if needed)
	changeToDeviceManageTab: 'change-to-device-manage-tab' // 切换到设备管理tab页
};
