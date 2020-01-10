import { Container } from 'inversify';

export function safeBindServices(container: Container, services: Function[]): void {
  services.forEach(s => {
    if (!container.isBound(s)) {
      container
        .bind(s)
        .toSelf()
        .inSingletonScope();
    }
  });
}
