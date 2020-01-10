import { IHttpContext } from 'lib-http';
import { IBeforeActivation } from 'lib-intercept';

export const MVC_QUERY_OR_PARAM = 'MVC_QUERY_OR_PARAM';

export class MVCParamDTO {
  constructor(public name: string, public idx: number) {}
}

export class MVCParamInterceptor implements IBeforeActivation {
  public before(context: IHttpContext): boolean {
    const activation = context.getActivation();
    if (!activation.method.tags[MVC_QUERY_OR_PARAM]) {
      activation.removeBeforeActivation(this, context);
      return true;
    }
    const params = activation.method.getAttributesOfType<MVCParamDTO>(MVCParamDTO);
    const args = context.getArguments();
    const req = context.getRequest();
    params.forEach(qop => {
      args[qop.idx] = req.param(qop.name) || req.query(qop.name) || req.body(qop.name);
    });
    return true;
  }
}
