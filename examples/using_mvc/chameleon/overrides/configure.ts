/* eslint-disable @typescript-eslint/no-var-requires */
import { DynamicModule, IHttpServer, RouteScanner } from '@mrazvan/lib-http';
import * as fs from 'fs';
import * as glob from 'glob';
import { Container, injectable } from 'inversify';
import { ILog, LogFactory } from 'lib-host';
import { defaultsDeep, isEmpty, isNil } from 'lodash';
import * as path from 'path';
import { MVCRouteScanner } from './route.scanner';

function scanForMVCFolders(options: MVCOptions, log: ILog): void {
  let directory = options.path;
  if (!path.isAbsolute(directory)) {
    directory = path.resolve(path.join(process.cwd(), directory));
  }
  const paths = fs.readdirSync(directory);
  // Check if any path starts with controller
  if (isNil(options.folders.controllers)) {
    log.info('Scanning for `Controllers` folder.');

    const controllerPath = paths.find(p => p.toLowerCase() === 'controllers');
    if (!isNil(controllerPath)) {
      // We found the 'controllers' folder
      options.folders.controllers = path.join(directory, controllerPath);
      log.info('    -> `Controllers` folder found ' + `'${options.folders.controllers}'`);
    } else {
      throw new Error(`'Controllers' folder not found for MVC functionality in root folder ${directory}.`);
    }
  }
  if (isNil(options.folders.views)) {
    log.verbose('Scanning for `Views` folder.');

    const viewsPath = paths.find(p => p.toLowerCase() === 'views');
    if (!isNil(viewsPath)) {
      // We found the 'views' folder
      options.folders.views = path.join(directory, viewsPath);
      log.info('    -> `Views` folder found ' + `'${options.folders.controllers}'`);
    } else {
      log.info('    -> `Views` folder NOT FOUND.');
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
    log.info(`Scanning for MVC controllers in folder '${mergedOptions.folders.controllers}'.`);
    const controllers = scanForControllers(mergedOptions.folders.controllers, log);
    if (!isEmpty(controllers)) {
      log.info(`    -> Found ${controllers.length} controllers.`);
      srv.addModule(DynamicModule('MVCModule', { controllers: controllers }));
    } else {
      log.info(`No controllers found for MVC system in path '${mergedOptions.folders.controllers}'`);
    }
  }
}

export function MVCConfigure(options?: Partial<MVCOptions>): (srv: Readonly<IHttpServer>) => void {
  return (srv: Readonly<IHttpServer>) => {
    const container = srv.container;
    const log = container.get<LogFactory>(LogFactory).createLog('MVCConfiguration');
    log.info('');
    log.info('');
    log.info(''.padStart(50, '*'));
    log.info('Configuring Server for MVC like functionality.');
    log.info(''.padStart(50, '*'));
    log.info('');
    log.info('');

    log.verbose('Binding the MVC route scanner.');
    // First rebind the scanner
    if (container.isBound(RouteScanner)) {
      container.rebind(RouteScanner).to(MVCRouteScanner);
    } else {
      container.bind(RouteScanner).to(MVCRouteScanner);
    }

    // Finally scan for MVC folders / controllers
    log.verbose('Configuring MVC system.');
    configureMVC(options, srv, log, container);
  };
}
