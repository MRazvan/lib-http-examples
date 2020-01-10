/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from '@mrazvan/lib-http';
import { ActionResult } from './action.result';

export class EmptyResult extends ActionResult {
  constructor() {
    super();
  }

  public ExecuteResult(ctx: IHttpContext): void {
    ctx.getResult().setSuccess(undefined);
  }
}

export function Empty(): ActionResult {
  return new EmptyResult();
}
