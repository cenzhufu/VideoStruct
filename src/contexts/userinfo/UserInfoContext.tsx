import * as React from 'react';
import { IFUserLoginInfo } from 'stsrc/utils/requests/user-auth-requests';
import { IFUserInfo } from 'stsrc/type-define';

// @ts-ignore
let defaultUserInfo: IBUserInfo | null = {};

const UserInfoContext = React.createContext({
	userInfo: defaultUserInfo,
	loginIn: (loginInfo: IFUserLoginInfo) => {},
	logOut: () => {},
	updateUserInfo: (info: Partial<IFUserInfo>) => {}
});

function withUserInfo<T = object>(
	Component: React.ComponentClass
): React.SFC<T> {
	return function UserInfoComponent(props: T) {
		return (
			<UserInfoContext.Consumer>
				{({ userInfo, loginIn, logOut, updateUserInfo }) => {
					return (
						<Component
							// @ts-ignore
							loginIn={loginIn}
							logOut={logOut}
							userInfo={userInfo}
							updateUserInfo={updateUserInfo}
							{...props}
						/>
					);
				}}
			</UserInfoContext.Consumer>
		);
	};
}

export default UserInfoContext;
export { withUserInfo };
