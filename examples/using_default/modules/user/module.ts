import { HttpModule } from '@mrazvan/lib-http';
import { Container } from 'inversify';
import { UserService } from '../../../../common/services/user';
import { Users } from './controllers/user';

@HttpModule({
  controllers: [Users]
  // interceptors interceptors that will be applied only for the controllers in this module
})
export class UserModule {
  public init(moduleContainer: Container, httpContainer: Container, hostContainer: Container): void {
    // moduleContainer -> The container assigned to this module
    //     Anything you register in that will be available only to this module
    // httpContainer -> The container that bellongs to the http server
    //     Anything you register in that will be available to all modules register in that http server
    // hostContainer -> The container that bellongs to the host app
    //     Anything you register in that will be available to everyone that is running / being created in the host
    //     Meaning:
    //          All http servers (for now)
    //          All modules in those servers

    /** **************************************************** */
    // The home controller will not be able to get the UserService
    moduleContainer
      .bind<UserService>(UserService)
      .toSelf()
      // Make it singleton so we can actually change user data
      //    since inversify will create a new instance of the service each and every time our controller get's called
      .inSingletonScope();
  }
}
