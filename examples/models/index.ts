/* eslint-disable @typescript-eslint/camelcase */
import { CallbackMiddlewareWrapper, Controller, DynamicModule, HttpContext, HTTPFactory, Post } from '@mrazvan/lib-http';
import * as CV from 'class-validator';
import { Container } from 'inversify';
import { Host } from 'lib-host';
import { IBeforeActivation, UseActivation } from 'lib-intercept';
import { flatten } from 'lodash';
import { RoutesDisplay } from '../../common/route.print';
import { ModelInterceptor } from './dto/interceptor';
import { UserDTO } from './models/user.dto';
import bodyParser = require('body-parser');

// Validate arguments of the methods, for simplicity validate all
class ClassValidator implements IBeforeActivation {
  public before(ctx: HttpContext): boolean {
    // Again for simplicity do it sync
    const validations = flatten(ctx.getArguments().map(arg => CV.validateSync(arg)));
    if (validations.length) {
      ctx.setError(validations);
      return false;
    }
    return true;
  }
}

@Controller('/model1')
class ModelV1 {
  @Post('/:userId')
  public update(user: UserDTO): any {
    const validation = CV.validateSync(user);
    if (validation.length > 0) {
      return { error: validation };
    }
    return { payload: user };
  }
}

@Controller('/model2')
class ModelV2 {
  @UseActivation(ClassValidator)
  @Post('/:userId')
  public update(user: UserDTO): string {
    return JSON.stringify(user);
  }
}

@Controller('/model3')
class ModelV3 {
  @Post('/:userId')
  public update(user: UserDTO): any {
    // No validation
    return { payload: user };
  }
}

new Host()
  .addModule({
    init: (container: Container) => {
      HTTPFactory.create(container)
        .addGlobalInterceptor(new CallbackMiddlewareWrapper(bodyParser.json()))
        .addGlobalInterceptor(ModelInterceptor)
        // Adding the following line will apply the ClassValidator interceptor to all API's registered in this http server
        // .addGlobalInterceptor(ClassValidator)
        // Configure our app
        .addModule(DynamicModule('ModelsModule', { controllers: [ModelV1, ModelV2, ModelV3] }))
        .onStarted(RoutesDisplay); // Display the routes once the server is started
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
