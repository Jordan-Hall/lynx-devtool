import { resolve } from 'path';
import { app } from 'electron';

export const getPath = (...relativePaths: string[]): string => {
  let path: string;

  if (app) {
    path = app.getPath('userData');
  } else {
    return '';
  }

  return resolve(path, ...relativePaths).replace(/\\/g, '/');
};

export function getAppPath(): string {
  if (app) {
    return app.getAppPath();
  } else {
    console.error('some thing may be wrong!');
    return '';
  }
}
