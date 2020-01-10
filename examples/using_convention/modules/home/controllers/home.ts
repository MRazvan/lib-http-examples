/* eslint-disable @typescript-eslint/camelcase */
import { Content } from '../../../../../common/responses/content';
import { File } from '../../../../../common/responses/file';
import { Json } from '../../../../../common/responses/json';
import { Redirect } from '../../../../../common/responses/redirect';
import { View } from '../../../../../common/responses/view';

export class ApiHome {
  // localhost:port/home/index -> we did not overwrite the path so by default it is the method name
  public default(): any {
    return Content('Hello World');
  }

  public getUpdate(): any {
    return Json({ Hello: 'World' });
  }

  public getObject(): any {
    return { Hello: 'World' };
  }

  public getPackage(q_name: string): any {
    return File('package.json', null, q_name);
  }

  public getGoogle(q_query: string): any {
    // Or it can be encapsulated in a return object and an interceptor to handle that, similar to MVC
    return Redirect('http://www.google.com/search?q=' + encodeURIComponent(q_query));
  }

  public getRss(): any {
    return View('dashboard');
  }

  // This method will not be exposed
  private _myInternalMethod(): void {
    console.log('Internal method');
  }
}
