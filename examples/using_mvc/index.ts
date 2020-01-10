import { CallbackMiddlewareWrapper, HTTPFactory } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host, RootConfig } from 'lib-host';
import * as path from 'path';
import { RoutesDisplay } from '../../common/route.print';
import { MVCProject } from './chameleon/overrides/app';
import { MVCConfigure } from './chameleon/overrides/configure';
import bodyParser = require('body-parser');

new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container, container.get<RootConfig>(RootConfig).scope('http'))
        .addGlobalInterceptor(new CallbackMiddlewareWrapper(bodyParser.json()))
        // Configure the needed services so we can simulate a basic .NET MVC style
        // Configure the path's for 'controllers' and 'views'
        // Load all controllers we find based on the convention '<x>Controller'
        .configure(MVCConfigure({ path: path.join(__dirname) }))
        // Add any global interceptors and services we need
        .configure(MVCProject)
        .onStarted(RoutesDisplay); // Display the routes once the server is started
    }
  })
  .init({
    log: {
      instances: {
        Config: 'Warn'
      }
    },
    http: {
      port: 3000
    },
    viewsRootPath: __dirname.replace('dist', '')
  })
  .start();
