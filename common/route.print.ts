import { IHttpServer } from '@mrazvan/lib-http';
import { LogFactory } from 'lib-host';
import { IActivation } from 'lib-intercept';
import { filter, flatten } from 'lodash';
import Table = require('cli-table3');
import colors = require('colors');

class Route {
  public module: string;
  public type: string;
  public path: string;
  public className: string;
  public methodName: string;
  public interceptors: string[];
  public returnType: string;
  constructor(data: Required<Route>) {
    Object.assign(this, data);
  }
}

function getReturnType(activation: IActivation): string {
  const methodReturnType = activation.method.returnType;
  return (methodReturnType ? methodReturnType.name : 'void | any') || 'any';
}

export function RoutesDisplay(server: IHttpServer): void {
  const routes: Route[] = [];
  const log = server.container.get<LogFactory>(LogFactory).createLog('RoutesDisplay');
  const apps = flatten(server.mountPoints.map(mp => mp.applications));
  apps.forEach(app => {
    app.routes.forEach(route => {
      routes.push(
        new Route({
          module: app.module.name || app.target.name,
          path: route.calculatedPath,
          className: route.activation.class.name,
          methodName: route.activation.method.name,
          type: route.apiAttribute.type,
          interceptors: [],
          returnType: getReturnType(route.activation)
        })
      );
    });
  });

  const newRoutes = routes.sort((a: Route, b: Route) => (a.path > b.path ? -1 : 1));
  const table: any = new Table({
    head: [],
    colWidths: [10, 50, 40, 20, 20]
  });
  let host = server.runConfiguration.options.host ? server.runConfiguration.options.host : 'localhost';
  if (host === '::') {
    host = 'localhost';
  }
  table.push([
    {
      content: `API's Exposed by the server on : ${host}:${server.runConfiguration.options.port}`,
      colSpan: 5
    }
  ]);
  table.push([{ content: "Number of API's : " + newRoutes.length, colSpan: 4 }]);

  let lastModule = '';
  newRoutes.forEach(r => {
    if (lastModule !== r.module) {
      const apisInModule = filter(newRoutes, route => route.module === r.module).length;
      table.push([
        {
          colSpan: 5,
          hAlign: 'center',
          content: colors.bold.green('\n' + r.module + ` (API's Count: ${apisInModule}) \n`)
        }
      ]);
      table.push([
        colors.bgRed.white('Type'),
        colors.bgRed.white('Path'),
        colors.bgRed.white('Class'),
        colors.bgRed.white('Method'),
        colors.bgRed.white('Return')
      ]);
      lastModule = r.module;
    }
    table.push([
      r.type === 'DELETE' ? colors.bgRed.white(r.type) : r.type,
      r.path,
      r.className,
      r.methodName,
      r.returnType
    ]);
  });
  log.verbose('\n' + table.toString());
}
