/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from 'lib-http';
import { ActionResult } from './action.result';

export class HttpStatusCodeResult extends ActionResult {
  constructor(private readonly _code: number, private readonly _message: string) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): void {
    ctx.getResponse().sendStatus(this._code, this._message);
  }
}

export function HttpStatusCode(code: number, message?: string): ActionResult {
  return new HttpStatusCodeResult(code, message);
}
