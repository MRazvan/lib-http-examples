/* eslint-disable @typescript-eslint/camelcase */
import { inject } from 'inversify';
import { isNil } from 'lodash';
import { Empty } from '../../../../../common/responses/empty.result';
import { HttpStatusCode } from '../../../../../common/responses/http.status.code';
import { Json } from '../../../../../common/responses/json';
import { View } from '../../../../../common/responses/view';
import { UserService } from '../../../../../common/services/user';

export class ApiUsers {
  @inject(UserService)
  private readonly _userService: UserService;

  // GET http://localhost:3000/user
  public default(): any {
    return View('index', { users: this._userService.getAll() });
  }

  // GET http://localhost:3000/user/find?email=
  public getFind(q_email: string): any {
    return Json(this._userService.getUserByEmail(q_email));
  }

  // POST http://localhost:3000/user/add   .... body : { email: 'someemail', password: 'somepassword' }
  public postAdd(q_email: string, b_password: string): void {
    this._userService.addUser(q_email, b_password);
  }

  // Same as above
  public postUpdate(q_email: string, b_password: string): any {
    const usr = this._userService.getUserByEmail(q_email);
    if (isNil(usr)) {
      return HttpStatusCode(400, 'User not found.');
    }
    usr.password = b_password;
    return Empty();
  }
}
