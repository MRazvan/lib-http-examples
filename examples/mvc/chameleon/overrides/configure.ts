/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
import * as glob from 'glob';
import { Container, injectable } from 'inversify';
import { ILog, LogFactory } from 'lib-host';
import { DynamicModuleGenerator, IHttpServer, RouteScanner } from 'lib-http';
import { defaultsDeep, isEmpty, isNil } from 'lodash';
import * as path from 'path';
import { safeBindServices } from '../../../common/helpers';
import { UserService } from '../../../common/services/user';
import { ActionResultInterceptor } from '../interceptors/action.interceptor';
import { ViewRenderer } from '../services/renderer';
import { MVCParamInterceptor } from './param.interceptor';
import { MVCRouteScanner } from './route.scanner';

function scanForMVCFolders(options: MVCOptions, log: ILog): void {
  let directory = options.path;
  if (!path.isAbsolute(directory)) {
    directory = path.resolve(path.join(process.cwd(), directory));
  }
  const paths = fs.readdirSync(directory);
  // Check if any path starts with controller
  if (isNil(options.folders.controllers)) {
    log.verbose('Scanning for `Controllers` folder.');

    const controllerPath = paths.find(p => p.toLowerCase() === 'controllers');
    if (!isNil(controllerPath)) {
      // We found the 'controllers' folder
      options.folders.controllers = path.join(directory, controllerPath);
    } else {
      throw new Error(`'Controllers' folder not found for MVC functionality in root folder ${directory}.`);
    }
  }
  if (isNil(options.folders.views)) {
    log.verbose('Scanning for `Views` folder.');

    const viewsPath = paths.find(p => p.toLocaleLowerCase() === 'views');
    if (!isNil(viewsPath)) {
      // We found the 'views' folder
      options.folders.views = path.join(directory, viewsPath);
    }
  }
}

// Scan the 'controllers' folder for all files and load them hopping the files will containe a controller
function scanForControllers(directory: string, log: ILog): Function[] {
  const controllers: Function[] = [];
  const files = glob.sync(path.join(directory, '**/*.js'));
  files.forEach(file => {
    try {
      const exported = require(file);
      Object.entries(exported).forEach((val: [string, any]) => {
        if (val[0].endsWith('Controller')) {
          log.debug(`Found Controller ${val[0]}`);
          controllers.push(val[1]);
        }
      });
    } catch (e) {
      log.error('Error loading file. During scan for controllers phase.', file);
    }
  });
  return controllers;
}

@injectable()
export class MVCOptions {
  public path: string;
  public folders: {
    controllers: string;
    views: string;
  };
  public autoScanControllers = true;
  constructor(data?: Partial<MVCOptions>) {
    if (!isNil(data)) {
      Object.assign(this, data);
    }
  }
}

function configureMVC(options: Partial<MVCOptions>, srv: Readonly<IHttpServer>, log: ILog, container: Container): void {
  const defaultOptions = new MVCOptions({
    path: process.cwd(),
    folders: { controllers: null, views: null },
    autoScanControllers: true
  });
  const mergedOptions: MVCOptions = new MVCOptions(defaultsDeep(options || {}, defaultOptions));
  container.bind(MVCOptions).toConstantValue(mergedOptions);

  log.verbose('Scanning for MVC folders.');
  // Scan the 'path' location for the various piece and pieces
  scanForMVCFolders(mergedOptions, log);

  if (mergedOptions.autoScanControllers) {
    log.verbose(`Scanning for MVC controllers in folder '${mergedOptions.folders.controllers}'.`);
    const controllers = scanForControllers(mergedOptions.folders.controllers, log);
    if (!isEmpty(controllers)) {
      srv.addModule(DynamicModuleGenerator('MVCModule', { controllers: controllers }));
    } else {
      log.info(`No controllers found for MVC system in path '${mergedOptions.folders.controllers}'`);
    }
  }
}

export function MVCConfigure(options?: Partial<MVCOptions>): (srv: Readonly<IHttpServer>) => void {
  return (srv: Readonly<IHttpServer>) => {
    const container = srv.container;
    const log = container.get<LogFactory>(LogFactory).createLog('MVCConfiguration');
    log.verbose('Binding the MVC route scanner.');
    // First rebind the scanner
    if (container.isBound(RouteScanner)) {
      container.rebind(RouteScanner).to(MVCRouteScanner);
    } else {
      container.bind(RouteScanner).to(MVCRouteScanner);
    }

    log.verbose('Adding MVC interceptors.');
    // Now add the interceptor
    srv.addGlobalInterceptor(MVCParamInterceptor);
    srv.addGlobalInterceptor(ActionResultInterceptor);

    // Finally scan for MVC folders / controllers
    log.verbose('Configuring MVC system.');
    configureMVC(options, srv, log, container);

    safeBindServices(container, [UserService, ViewRenderer]);
  };
}
