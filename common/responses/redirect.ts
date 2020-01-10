/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from '@mrazvan/lib-http';
import { ActionResult } from './action.result';

export class RedirectResult extends ActionResult {
  constructor(private readonly _url: string) {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): void {
    const resp = ctx.getResponse();
    resp.headers()['Location'] = this._url;
    resp.sendStatus(302);
  }
}
export function Redirect(url: string): RedirectResult {
  return new RedirectResult(url);
}
