/* eslint-disable @typescript-eslint/no-empty-function */
import { CallbackMiddlewareWrapper, ConfigureDefaultParamInterceptors, Controller, DefaultRouteHandler, DynamicModule, HTTPFactory } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host } from 'lib-host';
import { UseActivation } from 'lib-intercept';
import * as serve from 'serve-static';
@Controller()
export class DefaultHandlers {
  @DefaultRouteHandler()
  @UseActivation(new CallbackMiddlewareWrapper(serve(process.cwd(), { fallthrough: false })))
  public static(): void {}
}

// Create the host, and inside the host create a new http server.
//  Register our class in a new module and start the host
new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container)
        // This will add support for @Query, @Body @Header and the rest
        .configure(ConfigureDefaultParamInterceptors)
        .addModule(DynamicModule('Defaults', { controllers: [DefaultHandlers] }));
    }
  })
  .init({
    log: {
      instances: {
        Config: 'Warn'
      }
    }
  })
  .start();
