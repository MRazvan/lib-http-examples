import { IHttpServer } from '@mrazvan/lib-http';
import { safeBindServices } from '../../../../common/helpers';
import { ActionResultInterceptor } from '../../../../common/interceptors/action.interceptor';
import { ViewRenderer } from '../../../../common/services/renderer';
import { UserService } from '../../../../common/services/user';
import { MVCParamInterceptor } from './param.interceptor';

export function MVCProject(srv: Readonly<IHttpServer>): void {
  srv.addGlobalInterceptor(MVCParamInterceptor).addGlobalInterceptor(ActionResultInterceptor);
  safeBindServices(srv.container, [UserService, ViewRenderer]);
}
