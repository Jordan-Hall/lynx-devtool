import { BrowserWindow, screen } from 'electron';
import BasePage, { IPageParams } from '../base/BasePage';
import { getAppPath } from '../../utils/paths';
import { enable } from '@electron/remote/main';
import path from 'path';

class MobilePage extends BasePage<BrowserWindow> {
  getPageMode(): number {
    return 0; // mobile
  }

  onCreate(params: IPageParams): BrowserWindow {
    const screenWidth = screen?.getPrimaryDisplay()?.size?.width ?? 1920;
    const width = Math.floor((screenWidth * 3) / 4);
    const height = Math.floor(screenWidth / 2);
    const window = new BrowserWindow({
      title: 'Lynx DevTool',
      width,
      height,
      center: true,
      webPreferences: {
        backgroundThrottling: false,
        webSecurity: false,
        scrollBounce: true,
        experimentalFeatures: true,
        nodeIntegration: false,
        webviewTag: true,
        contextIsolation: true,
        nodeIntegrationInWorker: false,
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, 'preload.js'), //        `${getAppPath()}/preload.js`,
        partition: 'persist:ldt-mobile'
      }
    });
    enable(window.webContents);
    window.loadURL(params.ldtUrl);
    return window;
  }
  onRestart(params: IPageParams) {
    if (params.ldtUrl !== this.pageParams.ldtUrl) {
      this.win?.loadURL(params.ldtUrl);
    }
  }
}
export default MobilePage;
