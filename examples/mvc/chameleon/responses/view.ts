/* eslint-disable @typescript-eslint/member-naming */
import { LogFactory } from 'lib-host';
import { IHttpContext } from 'lib-http';
import * as path from 'path';
import { MVCOptions } from '../overrides/configure';
import { ViewRenderer } from '../services/renderer';
import { ActionResult } from './action.result';

export class ViewResult extends ActionResult {
  constructor(private _path: string, private readonly _data: any) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): Promise<void> {
    const response = ctx.getResponse();
    // Get the MVC options
    const options = ctx.getContainer().get<MVCOptions>(MVCOptions);
    const className = ctx.getRoute().controllerAttribute.path;
    let fullPath = this._path || ctx.getRoute().apiAttribute.path;
    // TODO : Get the class path and use that to get the view from the 'folders' view
    if (fullPath.indexOf('~') === 1) {
      fullPath = fullPath.replace('~', process.cwd());
    } else if (!path.isAbsolute(fullPath)) {
      fullPath = path.resolve(path.join(options.path.replace('dist', ''),'views', className, fullPath));
    }

    const renderService = ctx.getContainer().get<ViewRenderer>(ViewRenderer);
    if (!renderService.exists(fullPath)){
      const log = ctx.getContainer().get<LogFactory>(LogFactory).createLog('ViewActionResult');
      log.error(`View '${this._path}' does not exist. Resolved to ${fullPath}`);
      ctx.getResult().setError('Invalid view path.');
      return;
    }
    response.headers()['Content-Type'] = 'text/html';
    return renderService.render(fullPath, this._data).then((content) => {
      response.send(content)
    })
  }
}

export function View(path?: string, data?: any): ActionResult {
  return new ViewResult(path, data || {});
}
