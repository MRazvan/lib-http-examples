import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';

export const NO_ACTION = 'MVC_NoAction';
export const NoAction = (): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, d: any) => {
    md.tags[NO_ACTION] = true;
  });
