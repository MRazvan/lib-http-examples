/* eslint-disable @typescript-eslint/member-naming */
import { inject } from 'inversify';
import { isNil } from 'lodash';
import { ActionResult } from '../../../common/responses/action.result';
import { Empty } from '../../../common/responses/empty.result';
import { HttpStatusCode } from '../../../common/responses/http.status.code';
import { Json } from '../../../common/responses/json';
import { View } from '../../../common/responses/view';
import { UserService } from '../../../common/services/user';
import { HttpPost } from '../chameleon/attributes/http.methods';

export class UsersController {
  @inject(UserService)
  private readonly _userService: UserService;

  // GET http://localhost:3000/user
  public Index(): ActionResult {
    return View('index', { users: this._userService.getAll() });
  }

  // GET http://localhost:3000/user/find?email=
  public Find(email: string): ActionResult {
    return Json(this._userService.getUserByEmail(email));
  }

  // POST http://localhost:3000/user/add?email=''   .... body : { password: 'somepassword' }
  // POST http://localhost:3000/user/add   .... body : { email: 'someemail', password: 'somepassword' }
  // POST http://localhost:3000/user/add?email=''&password=''    body : {}
  @HttpPost()
  public Add(email: string, password: string): ActionResult {
    this._userService.addUser(email, password);
    return Empty();
  }

  // Same as above
  @HttpPost()
  public Update(email: string, password: string): ActionResult {
    const usr = this._userService.getUserByEmail(email);
    if (isNil(usr)) {
      return HttpStatusCode(400, 'User not found.');
    }
    usr.password = password;
    return Empty();
  }
}
