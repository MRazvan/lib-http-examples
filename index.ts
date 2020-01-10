import { Container } from 'inversify';
import { Host } from 'lib-host';
import { CallbackMiddlewareWrapper, HTTPFactory } from 'lib-http';
import * as path from 'path';
import { MVCConfigure } from './examples/mvc/chameleon/overrides/configure';
import bodyParser = require('body-parser');

const host = new Host();
host.addModule({
  init: (container: Container) => {
    HTTPFactory.create(container)
      .addGlobalInterceptor(new CallbackMiddlewareWrapper(bodyParser.json()))
      .configure(MVCConfigure({ path: path.join(__dirname, 'examples/mvc') }));
  }
});
host.start();
