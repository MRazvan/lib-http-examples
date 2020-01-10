import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';

export class ActionMethodDTO {
  constructor(public path: string) {}
}

export const ActionMethod = (action: string): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, d: any) => {
    md.attributesData.push(new ActionMethodDTO(action));
  });
