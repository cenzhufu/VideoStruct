// 没有权限的error
import IFError from 'ifvendors/utils/error';
import { ETargetType } from 'stsrc/type-define';

class EngineOfflineError extends IFError {
	offlineTargetEngines: ETargetType[] = [];
	constructor(
		offlineTargetEngines: ETargetType[],
		message: string = '引擎不在线'
	) {
		super(message);
		this.offlineTargetEngines = offlineTargetEngines;
	}
}

export default EngineOfflineError;
