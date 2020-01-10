/* eslint-disable @typescript-eslint/member-naming */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IHttpContext } from 'lib-http';

export abstract class ActionResult {
  protected constructor() {}
  public abstract ExecuteResult(ctx: IHttpContext): Promise<void> | void;
}
