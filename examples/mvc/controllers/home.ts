/* eslint-disable @typescript-eslint/member-naming */
import { ActionMethod } from '../chameleon/attributes/apis';
import { NoAction } from '../chameleon/attributes/no.action';
import { Content } from '../chameleon/responses/content';
import { File } from '../chameleon/responses/file';
import { Json } from '../chameleon/responses/json';
import { Redirect } from '../chameleon/responses/redirect';
import { View } from '../chameleon/responses/view';

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
