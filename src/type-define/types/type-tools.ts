export type OverrideKeyFrom<T, K extends keyof T> = {
	[P in keyof T]: P extends K ? any : T[P]
};

export type ExcludeKeyFrom<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
