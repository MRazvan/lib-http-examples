import { Controller, Get, Query } from '@mrazvan/lib-http';
import { ActionResult } from '../../../../../common/responses/action.result';
import { Content, ContentResult } from '../../../../../common/responses/content';
import { File, FileResult } from '../../../../../common/responses/file';
import { Json, JSONResult } from '../../../../../common/responses/json';
import { Redirect, RedirectResult } from '../../../../../common/responses/redirect';
import { View, ViewResult } from '../../../../../common/responses/view';

class CustomModel {}

@Controller()
export class Home {
  // localhost:port/home/index -> we did not overwrite the path so by default it is the method name
  @Get('/')
  public index(): ContentResult {
    return Content('Hello World');
  }

  @Get()
  public error(): ActionResult {
    throw new Error('Custom error');
  }

  @Get()
  public update(): JSONResult {
    return Json({ Hello: 'World' });
  }

  @Get()
  public object(): any {
    return { Hello: 'World' };
  }

  @Get()
  public package(@Query('name') name: string): FileResult {
    return File('package.json', null, name);
  }

  @Get()
  public google(@Query('query') query: string): RedirectResult {
    // Or it can be encapsulated in a return object and an interceptor to handle that, similar to MVC
    return Redirect('http://www.google.com/search?q=' + encodeURIComponent(query));
  }

  @Get()
  public string(): string[] {
    // Or it can be encapsulated in a return object and an interceptor to handle that, similar to MVC
    return ['Hello World'];
  }

  @Get()
  public custom(): CustomModel {
    // Or it can be encapsulated in a return object and an interceptor to handle that, similar to MVC
    return new CustomModel();
  }

  @Get()
  public rss(): ViewResult {
    return View('dashboard');
  }

  // This method will not be exposed
  private _myInternalMethod(): void {
    console.log('Internal method');
  }
}
