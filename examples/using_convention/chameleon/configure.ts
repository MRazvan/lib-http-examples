/* eslint-disable @typescript-eslint/no-var-requires */
import { IHttpServer, RouteScanner } from '@mrazvan/lib-http';
import { LogFactory } from 'lib-host';
import { ConventionRouteScanner } from './route.scanner';

export function ConventionConfiguration(srv: Readonly<IHttpServer>): void {
  const container = srv.container;
  const log = container.get<LogFactory>(LogFactory).createLog('ConventionConfiguration');
  log.info('');
  log.info('');
  log.info(''.padStart(30, '*'));
  log.info('Configuring Server for Convention based project functionality.');
  log.info(''.padStart(30, '*'));

  log.verbose('Binding the Convention route scanner.');
  // First rebind the scanner
  if (container.isBound(RouteScanner)) {
    container.rebind(RouteScanner).to(ConventionRouteScanner);
  } else {
    container.bind(RouteScanner).to(ConventionRouteScanner);
  }
}
