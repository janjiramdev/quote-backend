export interface IUserInterface {
  _id: string;
  username: string;
  displayName: string;
}

export interface ICreateOneUserInput {
  username: string;
  displayName: string;
  password: string;
}
