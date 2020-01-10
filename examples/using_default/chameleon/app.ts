import { IHttpServer } from '@mrazvan/lib-http';
import { safeBindServices } from '../../../common/helpers';
import { ActionResultInterceptor } from '../../../common/interceptors/action.interceptor';
// Just use the view render from mvc don't make another one
import { ViewRenderer } from '../../../common/services/renderer';
import { UserService } from '../../../common/services/user';
import { UserModule } from '..//modules/user/module';
import { HomeModule } from '../modules/home/module';

export function DefaultProject(srv: Readonly<IHttpServer>): void {
  safeBindServices(srv.container, [UserService, ViewRenderer]);
  srv
    .addModule(HomeModule)
    .addModule(UserModule)
    .addGlobalInterceptor(ActionResultInterceptor);
}
