/* eslint-disable @typescript-eslint/camelcase */
import { Controller, DynamicModule, Get, HTTPFactory, JsonSchema, JsonSerializer } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host } from 'lib-host';

// Create our controller
@Controller('/')
class Hello {
  @Get('/')
  @JsonSchema({
    type: 'object',
    properties: {
      hello: {
        type: 'string'
      }
    }
  })
  public static sayHello(): any {
    return { hello: 'world' };
  }
}

// Create the host, and inside the host create a new http server.
//  Register our class in a new module and start the host
Host.build((container: Container, host: Host) => {
  HTTPFactory.create(container, host.config.scope('http'))
    .addGlobalInterceptor(JsonSerializer)
    .addModule(DynamicModule('HelloModule', { controllers: [Hello] }));
}).start({
  log: {
    instances: {
      Config: 'Warn'
    }
  },
  http: {
    port: 3000
  }
});
