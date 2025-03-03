// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function extractHeaderParams(req: any) {
  console.log(Array.from(Object.keys(req.headers)));
  return Array.from(Object.keys(req.headers))
    .map((key) => {
      return ['-H', `'${key}: ${req.headers[key]}'`];
    })
    .reduce((accum, headerArg) => accum.concat(headerArg), []);
}

export function reqToCurl(req: any) {
  console.log(req);
  let cmd = ['curl'];
  cmd = cmd.concat(['-X', req.method]);
  cmd = cmd.concat(extractHeaderParams(req));
  if (req.body) {
    cmd = cmd.concat(['-d', `'${req.body}'`]);
  }
  cmd.push(`'${req.url}'`);
  return cmd.join(' ');
}
