import trace_to_text from './trace_to_text.js';

export function assertExists(value) {
  if (value === null || value === undefined) {
    throw new Error("Value doesn't exist");
  }
  return value;
}

function defer() {
  let resolve = null;
  let reject = null;
  const p = new Promise((res, rej) => ([resolve, reject] = [res, rej]));
  return Object.assign(p, { resolve, reject });
}

async function generateBlob(src) {
  let blob = new Blob();
  if (src.type === 'URL') {
    const resp = await fetch(src.url);
    if (resp.status !== 200) {
      throw new Error(`fetch() failed with HTTP error ${resp.status}`);
    }
    blob = await resp.blob();
  } else if (src.type === 'ARRAY_BUFFER') {
    blob = new Blob([new Uint8Array(src.buffer, 0, src.buffer.byteLength)]);
  } else if (src.type === 'FILE') {
    blob = src.file;
  } else {
    throw new Error(`Conversion not supported for ${JSON.stringify(src)}`);
  }
  return blob;
}

export function ConvertTrace(trace, format = 'json') {
  const outPath = '/trace.json';
  const args = [format];
  args.push('/fs/trace.pftrace', outPath);
  // generateBlob({
  //   type: 'URL',
  //   url: './lynx-profile-trace-2021-05-21-065450.pftrace',
  // }).then((traceBlob) => {
  const file = new File([trace], 'trace.proto');
  runTraceconv(file, args)
    .then((module) => {
      const fsNode = module.FS.lookupPath(outPath).node;
      const data = fsNode.contents.buffer;
      const size = fsNode.usedBytes;
      const arr = new Uint8Array(data, 0, size);
      const str = new TextDecoder('utf-8').decode(arr);
      postMessage(JSON.parse(str));
      // globals.publish('LegacyTrace', {data, size}, /*transfer=*/[data]);
      module.FS.unlink(outPath);
    })
    .catch((e) => {
      console.log(e);
    })
    .finally(() => { });
  // });
}

function updateProgress(rawMsg) {
  const msgArr = rawMsg.split(' ');
  const idx = msgArr.findIndex((item) => (item === 'MB')) - 1;
  const message = idx < 0 ? rawMsg : msgArr.slice(idx, idx + 2).join(' ');
  const msg = {
    type: 'progress',
    message,
  };
  postMessage(msg);
  console.log(rawMsg);
}

async function runTraceconv(trace, args) {
  const deferredRuntimeInitialized = defer();
  const module = trace_to_text({
    noInitialRun: true,
    locateFile: (s) => s,
    print: console.log,
    printErr: updateProgress,
    onRuntimeInitialized: () => deferredRuntimeInitialized.resolve(),
  });
  await deferredRuntimeInitialized;
  module.FS.mkdir('/fs');
  module.FS.mount(
    assertExists(module.FS.filesystems.WORKERFS),
    { blobs: [{ name: 'trace.pftrace', data: trace }] },
    '/fs',
  );
  module.callMain(args);
  return module;
}

onmessage = function (e) {
  console.log('Worker: Message received from main script');
  ConvertTrace(e.data);
};
