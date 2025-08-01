export interface IAuthTokens {
  accessToken: string;
}

export interface IAuthTokenDetail {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
