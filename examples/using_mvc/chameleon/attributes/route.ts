import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';

export class RouteDataDTO {
  constructor(public path: string) {}
}

export const Route = (route: string): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, d: any) => {
    md.attributesData.push(new RouteDataDTO(route));
  });
