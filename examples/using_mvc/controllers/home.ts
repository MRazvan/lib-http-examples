/* eslint-disable @typescript-eslint/member-naming */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Content } from '../../../common/responses/content';
import { File } from '../../../common/responses/file';
import { Json } from '../../../common/responses/json';
import { Redirect } from '../../../common/responses/redirect';
import { View } from '../../../common/responses/view';
import { ActionMethod } from '../chameleon/attributes/apis';
import { NoAction } from '../chameleon/attributes/no.action';

export class HomeController {
  // GET http://localhost:3000/home
  public Index(): any {
    return Content('Hello World');
  }

  // GET http://localhost:3000/home/json
  public Update(): any {
    return Json({ Hello: 'World' });
  }

  // GET http://localhost:3000/home/object
  public Object(): any {
    return { Hello: 'World' };
  }

  // GET http://localhost:3000/home/package?name=app.package.json
  public Package(name: string): any {
    return File('package.json', null, name);
  }

  // GET http://localhost:3000/home/google?q=NodeJS MVC
  public Google(q: string): any {
    return Redirect('http://www.google.com/search?q=' + encodeURIComponent(q));
  }

  // GET http://localhost:3000/home/dashboard
  @ActionMethod('dashboard')
  public RSS(): any {
    return View();
  }

  // This method will not be exposed
  @NoAction()
  public MyInternalMethod(): void {}
}
