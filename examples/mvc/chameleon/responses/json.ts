/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from 'lib-http';
import { ActionResult } from './action.result';

export class JSONResult extends ActionResult {
  constructor(private readonly _data: Record<any, any> | any[]) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): void {
    ctx.getResponse().send(this._data);
  }
}

export function Json(data: Record<any, any> | any[]): ActionResult {
  return new JSONResult(data);
}
