import { BrowserWindow } from 'electron';

export interface IPageParams {
  ldtUrl: string; // lynx-devtool-web address
  schema?: URL; // deep-link
  // MOBILE = 0,
  // SIMULATOR = 1,
  // SIMULATOR_LYNX = 2
  pageMode?: 0 | 1 | 2; // Real device or simulator
  viewMode?: 'lynx' | 'web'; // lynx or web
  forceRefresh?: boolean;
}

abstract class BasePage<T extends BrowserWindow> {
  win: T | null;
  isDev = process.env.NODE_ENV === 'development';
  pageParams: IPageParams;

  create(params: IPageParams): T {
    if (!this.pageParams) {
      this.pageParams = params;
    }
    const url = new URL(params.ldtUrl);
    // Pass pageMode to lynx-devtool-web
    url.searchParams.set('pageMode', '0');
    // Pass viewMode to lynx-devtool-web

    url.searchParams.set('viewMode', 'lynx');
    params.ldtUrl = url.toString();
    if (this.win) {
      this.onRestart(params);
    } else {
      this.win = this.onCreate(params);
      this.win.on('close', () => {
        this.destroy();
      });
    }
    Object.assign(this.pageParams, params);

    return this.win;
  }

  destroy() {
    if (this.win) {
      this.onDestroy();
      const window = this.win;
      this.win = null;
      window.close();
    }
  }

  protected onDestroy() {
    console.log(`${this.getPageMode()} onDestroy`);
  }

  abstract getPageMode(): PageMode;
  protected abstract onRestart(params: IPageParams);
  protected abstract onCreate(params: IPageParams): T;
}

export default BasePage;
