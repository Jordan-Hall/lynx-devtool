// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { toolkitExecutor } from './command';
import { UPDATOR_DEFAULT_CHANNEL } from './utils';
const yargs = require('yargs');

function run() {
  const command = yargs
    .option('logLevel', {
      description: 'Log level',
      type: 'number',
      demandOption: false
    })
    .option('ignoreLDTApp', {
      description: 'If set to true, LDT platform will be started in browser instead of Lynx DevTool App',
      type: 'boolean',
      default: false,
      demandOption: false
    })
    .option('openWebview', {
      description: 'Whether to open the web page',
      type: 'boolean',
      default: true,
      demandOption: false
    })
    .option('disableWSS', {
      description:
        'Whether to disable websocket server, When this option is set to true, the WebSocket server will not be started. default is false',
      type: 'boolean',
      default: false,
      demandOption: false
    })
    .option('wss', {
      description: 'External websocket server address, only valid when disableWSS is true.',
      type: 'string',
      demandOption: false
    })
    .option('room', {
      description: 'External room, only valid when disableWSS is true.',
      type: 'string',
      demandOption: false
    })
    .option('debug', {
      description: 'For debug',
      type: 'boolean',
      default: false,
      demandOption: false,
      hidden: true
    })
    .option('upgradeChannel', {
      description: `upgrade channel, default is ${UPDATOR_DEFAULT_CHANNEL}`,
      type: 'string',
      default: UPDATOR_DEFAULT_CHANNEL,
      demandOption: false
    })
    .option('setupRes', {
      description:
        'If set to true, it will download and setup both cn and i18n resources, but it will not open LDT itself. Default is false. ',
      type: 'boolean',
      default: false,
      demandOption: false
    })
    .version()
    .help()
    .alias('version', 'v')
    .alias('help', 'h');
  toolkitExecutor(command.argv);
}

export { toolkitExecutor, run };
export * from './command';
export * from './updator/updator';
export * from './utils';
