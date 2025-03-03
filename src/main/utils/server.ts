import { toolkitExecutor, getDebugDriver, sendUsbMessageToWeb, CliOptions } from '@lynx-dev/lynx-devtool-cli';

export interface LDTServerOptions extends CliOptions {
  forceNew?: boolean;
}
class LDTServer {
  ldtUrl: string | null = null;

  async start(options: LDTServerOptions = {}): Promise<string> {
    if (!this.ldtUrl || options.forceNew) {
      this.ldtUrl = await toolkitExecutor({
        openWebview: false,
        runType: 'electron-v3',
        upgradeChannel: '3x',
        debug: process.env.NODE_ENV === 'development',
        // debug: true,
        progressListener: options?.progressListener
      });
    }

    return this.ldtUrl;
  }

  getDebugDriver() {
    return getDebugDriver();
  }

  getHost() {
    if (this.ldtUrl) {
      const url = new URL(this.ldtUrl);
      return url.host;
    }
    return null;
  }

  sendMessageToWeb(id: number, message: string) {
    sendUsbMessageToWeb(id, message);
  }
}

const ldtServer = new LDTServer();
export default ldtServer;
