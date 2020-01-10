/* eslint-disable @typescript-eslint/member-naming */
import { IHttpContext } from '@mrazvan/lib-http';
import * as fs from 'fs';
import { isNil } from 'lodash';
import * as mt from 'mime-types';
import * as path from 'path';
import { promisify } from 'util';
import { ActionResult } from './action.result';

export class FileResult extends ActionResult {
  constructor(private _path: string, private readonly _contentType: string, private _fileName: string) {
    super();
  }

  public async ExecuteResult(ctx: IHttpContext): Promise<void> {
    const response = ctx.getResponse();

    if (this._path.indexOf('~') === 1) {
      this._path = this._path.replace('~', process.cwd());
    } else if (!path.isAbsolute(this._path)) {
      this._path = path.join(process.cwd(), this._path);
    }

    const fullPath = path.resolve(this._path);
    const asyncExists = promisify(fs.exists);
    const exists = await asyncExists(fullPath);

    if (!exists) {
      throw new Error('File Not Found.');
    }
    this._fileName = this._fileName || path.basename(fullPath);

    // Set the headers on the response
    const headers = response.headers();
    headers['Content-Type'] = this._contentType || mt.lookup(this._fileName) || 'text/plain';
    if (!isNil(this._fileName)) {
      headers['Content-Disposition'] = `attachment; filename="${this._fileName}"`;
    } else {
      headers['Content-Disposition'] = `attachment`;
    }
    response.setHeaders();

    // Pipe the file and wait for it to finish
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this._path);
      stream.pipe(response.getRaw());
      stream.on('close', resolve);
      stream.on('error', reject);
    });
  }
}
export function File(path: string, contentType?: string, fileName?: string): FileResult {
  return new FileResult(path, contentType, fileName);
}
