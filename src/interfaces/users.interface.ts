export interface IUserInterface {
  _id: string;
  username: string;
  displayName?: string;
}

export interface ICreateUserInput {
  username: string;
  displayName: string;
  password: string;
}
