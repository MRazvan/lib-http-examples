/* eslint-disable @typescript-eslint/camelcase */
import {
  ConfigureDefaultParamInterceptors,
  Controller,
  DynamicModule,
  Get,
  HTTPFactory,
  Query
} from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host } from 'lib-host';
import { RoutesDisplay } from '../../common/route.print';

// Create our controller
@Controller()
class Hello {
  @Get('/')
  public sayHello(@Query('name', 'Unknown') name: string): string {
    return `Hello ${name}`;
  }
}

@Controller('/')
class WhatIsMyAge {
  @Get('/')
  public sayAge(): number {
    return Math.ceil(Math.random() * 100);
  }
}

// Create the host, and inside the host create a new http server.
//  Register our class in a new module and start the host
new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container)
        // This will add support for @Query, @Body @Header and the rest
        .configure(ConfigureDefaultParamInterceptors)
        .addModule(DynamicModule('HelloModule', { controllers: [Hello] }))
        .onStarted(RoutesDisplay); // Display routes
      // Create the second server
      HTTPFactory.create(container)
        // This will add support for @Query, @Body @Header and the rest
        .configure(ConfigureDefaultParamInterceptors)
        .addModule(DynamicModule('AgeModule', { controllers: [WhatIsMyAge] }))
        .onStarted(RoutesDisplay); // Display routes
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
