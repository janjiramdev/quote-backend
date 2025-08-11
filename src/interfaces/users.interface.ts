export interface IUserInterface {
  _id: string;
  username: string;
  displayName: string;
}

export interface ICreateUserInput {
  username: string;
  displayName: string;
  password: string;
}

export interface IUpdateUserRefreshTokenInput {
  _id: string;
  refreshToken: string;
}
