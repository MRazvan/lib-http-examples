import * as ejs from 'ejs';
import * as fs from 'fs';
import { injectable } from 'inversify';
import { isNil } from 'lodash';

@injectable()
export class ViewRenderer {
  public render(viewPath: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(this._addExtension(viewPath), data, (err, content) => {
        if (!isNil(err)) {
          reject(err);
        } else {
          resolve(content);
        }
      });
    });
  }
  public exists(path: string): boolean {
    return fs.existsSync(this._addExtension(path));
  }

  private _addExtension(path: string): string {
    return path.endsWith('ejs') ? path : `${path}.ejs`;
  }
}
