/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from 'lib-http';
import { ActionResult } from './action.result';

export class ContentResult extends ActionResult {
  constructor(private readonly _data: string | number | boolean) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): void {
    ctx.getResponse().send(this._data);
  }
}

export function Content(data: string | number | boolean): ActionResult {
  return new ContentResult(data);
}
