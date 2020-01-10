/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from '@mrazvan/lib-http';
import { LogFactory, RootConfig } from 'lib-host';
import * as path from 'path';
import { ViewRenderer } from '../services/renderer';
import { ActionResult } from './action.result';

export class ViewResult extends ActionResult {
  constructor(private readonly _path: string, private readonly _data: any) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): Promise<void> {
    const response = ctx.getResponse();
    const rootPath = ctx
      .getContainer()
      .get(RootConfig)
      .get<string>('viewsRootPath', process.cwd());
    // Get the MVC options
    const className = ctx.getRoute().controllerAttribute.path;
    let fullPath = this._path || ctx.getRoute().apiAttribute.path;
    // TODO : Get the class path and use that to get the view from the 'folders' view
    if (fullPath.indexOf('~') === 1) {
      fullPath = fullPath.replace('~', process.cwd());
    } else if (!path.isAbsolute(fullPath)) {
      fullPath = path.resolve(path.join(rootPath, 'views', className, fullPath));
    }

    const renderService = ctx.getContainer().get<ViewRenderer>(ViewRenderer);
    if (!renderService.exists(fullPath)) {
      const log = ctx
        .getContainer()
        .get<LogFactory>(LogFactory)
        .createLog('ViewActionResult');
      log.error(`View '${this._path}' does not exist. Resolved to ${fullPath}`);
      ctx.getResult().setError('Invalid view path.');
      return;
    }
    response.headers()['Content-Type'] = 'text/html';
    return renderService.render(fullPath, this._data).then(content => {
      response.send(content);
    });
  }
}

export function View(path?: string, data?: any): ViewResult {
  return new ViewResult(path, data || {});
}
