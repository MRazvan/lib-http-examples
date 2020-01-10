import { CallbackMiddlewareWrapper, ConfigureDefaultParamInterceptors, HTTPFactory } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { Host } from 'lib-host';
import { RoutesDisplay } from '../../common/route.print';
import { ConventionProject } from './chameleon/app';
import { ConventionConfiguration } from './chameleon/configure';
import bodyParser = require('body-parser');

new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container)
        .addGlobalInterceptor(new CallbackMiddlewareWrapper(bodyParser.json()))
        // This will add support for @Query, @Body @Header and the rest
        .configure(ConfigureDefaultParamInterceptors)
        // Configure the needed services so we can have convention based controllers / api
        //    The convention is:
        //    - Api<something> for the base route
        //    - (get|post|put|delete)SomeName for the child route
        //    - (q_|p_|b_)name for the location of the arguments (query, param, body)
        .configure(ConventionConfiguration)
        // Configure our app
        .configure(ConventionProject)
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
