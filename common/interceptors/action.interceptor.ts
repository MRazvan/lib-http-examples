import { IHttpContext } from '@mrazvan/lib-http';
import { IAfterActivation } from 'lib-intercept';
import { ActionResult } from '../responses/action.result';

export class ActionResultInterceptor implements IAfterActivation {
  public async after(context: IHttpContext): Promise<void> {
    const response = context.getResult();
    if (response.isError()) {
      return;
    }
    let payload = response.payload;
    if (payload instanceof Promise) {
      payload = await payload;
    }
    if (payload instanceof ActionResult) {
      const executeResult = payload.ExecuteResult(context);
      if (executeResult instanceof Promise) {
        context.getResult().setSuccess(executeResult);
      }
    }
  }
}
