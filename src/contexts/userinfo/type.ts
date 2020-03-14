import { IFUserInfo } from 'sttypedefine';
import { IFUserLoginInfo } from 'stsrc/utils/requests/user-auth-requests';

export interface UserInfoContextType {
	userInfo: IFUserInfo | null;
	loginIn: (loginInfo: IFUserLoginInfo) => void;
	logOut: () => void;
	updateUserInfo: (info: Partial<IFUserInfo>) => void;
}
