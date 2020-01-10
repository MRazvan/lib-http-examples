/* eslint-disable @typescript-eslint/camelcase */
import { Body, Controller, Get, Post, Query } from '@mrazvan/lib-http';
import { inject } from 'inversify';
import { isNil } from 'lodash';
import { Empty } from '../../../../../common/responses/empty.result';
import { HttpStatusCode } from '../../../../../common/responses/http.status.code';
import { Json } from '../../../../../common/responses/json';
import { View } from '../../../../../common/responses/view';
import { UserService } from '../../../../../common/services/user';

@Controller()
export class Users {
  @inject(UserService)
  private readonly _userService: UserService;

  // GET http://localhost:3000/user
  @Get('/')
  public index(): any {
    return View('index', { users: this._userService.getAll() });
  }

  // GET http://localhost:3000/user/find?email=
  @Get()
  public find(@Query('email') email: string): any {
    return Json(this._userService.getUserByEmail(email));
  }

  // POST http://localhost:3000/user/add   .... body : { email: 'someemail', password: 'somepassword' }
  @Post()
  public add(@Query('email') email: string, @Body('password') password: string): void {
    this._userService.addUser(email, password);
  }

  // Same as above
  @Post()
  public update(@Query('email') email: string, @Body('password') password: string): any {
    const usr = this._userService.getUserByEmail(email);
    if (isNil(usr)) {
      return HttpStatusCode(400, 'User not found.');
    }
    usr.password = password;
    return Empty();
  }
}
