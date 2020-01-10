/* eslint-disable @typescript-eslint/camelcase */
import { CallbackMiddlewareWrapper, ConfigureDefaultParamInterceptors, HTTPFactory } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host } from 'lib-host';
import { RoutesDisplay } from '../../common/route.print';
import { DefaultProject } from './chameleon/app';
import bodyParser = require('body-parser');

new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container)
        .addGlobalInterceptor(new CallbackMiddlewareWrapper(bodyParser.json()))
        // This will add support for @Query, @Body @Header and the rest
        .configure(ConfigureDefaultParamInterceptors)
        // Configure our app
        .configure(DefaultProject)
        .onStarted(RoutesDisplay); // Display the routes once the server is started
    }
  })
  .init({
    log: {
      instances: {
        Config: 'Warn'
      }
    },
    viewsRootPath: __dirname.replace('dist', '')
  })
  .start();
