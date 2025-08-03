export interface IAuthTokens {
  accessToken: string;
}

export interface IAuthTokenDetail {
  sub: string;
  username: string;
  displayName: string;
  iat?: number;
  exp?: number;
}
