import { IHttpServer } from '@mrazvan/lib-http';
import { safeBindServices } from '../../../common/helpers';
import { ActionResultInterceptor } from '../../../common/interceptors/action.interceptor';
import { ViewRenderer } from '../../../common/services/renderer';
import { HomeModule } from '../modules/home/module';
import { UserModule } from '../modules/user/module';

export function ConventionProject(srv: Readonly<IHttpServer>): void {
  safeBindServices(srv.container, [ViewRenderer]);
  srv
    .addGlobalInterceptor(ActionResultInterceptor)
    .addModule(HomeModule)
    .addModule(UserModule);
}
