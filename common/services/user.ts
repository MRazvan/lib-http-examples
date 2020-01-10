import { injectable } from 'inversify';
import { isNil, remove } from 'lodash';

export class User {
  constructor(public email: string, public password: string) {}
}

@injectable()
export class UserService {
  private _users: User[] = [
    new User('User1@email.com', '1'),
    new User('User2@email.com', '2'),
    new User('User3@email.com', '3'),
    new User('User4@email.com', '4'),
    new User('User5@email.com', '5'),
    new User('User6@email.com', '6')
  ];

  public getAll(): User[] {
    return this._users;
  }

  public getUserByEmail(email: string): User {
    return this._users.find(u => u.email === email);
  }

  public addUser(email: string, password: string): User {
    const usr = new User(email, password);
    this._users.push(usr);
    return usr;
  }

  public deleteUser(email: string): User {
    const usr = this.getUserByEmail(email);
    if (isNil(usr)) {
      return null;
    }
    this._users = remove(this._users, usr);
    return usr;
  }
}
