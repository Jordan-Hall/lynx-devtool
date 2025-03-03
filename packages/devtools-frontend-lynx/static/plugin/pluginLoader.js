// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as UI from "../ui/legacy/legacy.js";
import * as ObjectUI from "../ui/legacy/components/object_ui/object_ui.js";
import * as SDK from "../core/sdk/sdk.js";
import createLoadRemoteModule, { createRequires } from "./dist/index.js";

let currentNodeId;
let currentNodeData;
UI.Context.Context.instance().addFlavorChangeListener(
  SDK.DOMModel.DOMNode,
  async (node) => {
    const componentId = await SDK.TargetManager.TargetManager.instance()
      .mainTarget()
      .lynxAgent()
      .invoke_getComponentId({ nodeId: node.data.id });
    currentNodeId = componentId;
    currentNodeData = node.data;
    updateNodeSelected();
  },
  {}
);

const updateNodeSelected = () => {
  selectedNodeChangedListeners.forEach((l) =>
    l(currentNodeId, currentNodeData)
  );
};

const selectedNodeChangedListeners = [];

const addSelectedNodeChangedListener = (listener) => {
  selectedNodeChangedListeners.push(listener);
};

export const logExpression = (text) => {
  const currentExecutionContext = UI.Context.Context.instance().flavor(
    SDK.RuntimeModel.ExecutionContext
  );
  if (currentExecutionContext) {
    const executionContext = currentExecutionContext;
    const message = SDK.ConsoleModel.ConsoleModel.instance().addCommandMessage(
      executionContext,
      text
    );
    const expression =
      ObjectUI.JavaScriptREPL.JavaScriptREPL.preprocessExpression(text);
    SDK.ConsoleModel.ConsoleModel.instance().evaluateCommandInConsole(
      executionContext,
      message,
      expression,
      false
    );
  }
};

const dependencies = {
  react: React,
};

const requires = createRequires(dependencies);
const commonjsLoader = createLoadRemoteModule({ requires });

// @ts-ignore
window.addEventListener("message", (event) => {
  if (!event.data) {
    return;
  }
  switch (event.data.type) {
    case "lynx_message":
      const type = `Remote.Customized.${event.data.content.type}`;
      remoteListenerMap[type]?.forEach((listener) =>
        listener(event.data.content.message)
      );
      // Process plug-in (such as jsb and resource) messages, and CDP messages are all handled by Connection
      if (event.data.content.type !== "CDP") {
        batchMessage(type, event.data.content.message);
      }
      break;
  }
});

const remoteListenerMap = {};
const extensionListenerMap = {};
const messageBatcher = {};

const batchMessage = (type, listener) => {
  if (!messageBatcher[type]) {
    messageBatcher[type] = [];
  }
  messageBatcher[type].push(listener);
};

const addRemoteListener = (type, listener) => {
  if (!remoteListenerMap[type]) {
    remoteListenerMap[type] = [];
  }
  remoteListenerMap[type].push(listener);
  messageBatcher[type]?.forEach((msg) => listener(msg));
  messageBatcher[type] = [];
};

const addExtensionListener = (type, listener) => {
  if (!extensionListenerMap[type]) {
    extensionListenerMap[type] = [];
  }
  extensionListenerMap[type].push(listener);
  messageBatcher[type]?.forEach((msg, i, o) => {
    if (msg.target) {
      if (msg.target === `Extensions.${listener.receiver}`) {
        listener.listener(msg.message);
        o.splice(i, 1);
      }
    } else {
      listener.listener(msg);
      o.splice(i, 1);
    }
  });
};

export const addEventListener = (id) => (type, listener) => {
  const domains = type.split(".");
  if (domains[0] === "Remote") {
    addRemoteListener(type, listener);
  } else if (domains[0] === "Extensions") {
    addExtensionListener(type, { listener, receiver: id });
  }
};

export const postMessage = (id) => (type, message) => {
  const domains = type.split(".");
  if (domains[0] === "Remote") {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    window.parent.postMessage(
      { type: "send_message", content: { type: domains[2], message } },
      "*"
    );
  } else if (domains[0] === "LDT") {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    window.parent.postMessage(
      {
        type: "plugin",
        content: {
          type: domains[1],
          message,
        },
      },
      "*"
    );
  } else if (domains[0] === "Extensions") {
    if (domains.length > 1) {
      extensionListenerMap[`Extensions.${id}`]?.forEach((i) => {
        if (i.receiver === domains[1]) {
          i.listener(message);
        }
      });
      batchMessage(`Extensions.${id}`, { message, target: type });
    } else {
      if (extensionListenerMap[`Extensions.${id}`]) {
        extensionListenerMap[`Extensions.${id}`]?.forEach((i) =>
          i.listener(message)
        );
      } else {
        batchMessage(`Extensions.${id}`, message);
      }
    }
  }
};

class PluginPanel extends UI.Panel.Panel {
  _wasShown;
  constructor(name, c, id, lifecycles) {
    super(name);
    this._wasShown = lifecycles?.wasShown;
    ReactDOM.render(
      React.createElement(c, {
        registerPlugin,
        addEventListener: addEventListener(id),
        postMessage: postMessage(id),
        addSelectedNodeChangedListener,
        logExpression,
      }),
      this.contentElement
    );
    setTimeout(() => {
      updateNodeSelected();
    }, 0);
  }
  // lifecycle methods provided by Widget.ts
  wasShown() {
    if (this._wasShown) {
      this._wasShown();
    }
  }
}

const loadedPluginModuleMap = {};
async function loadPluginModule(fileURL, refresh) {
  let loadedPluginModule = refresh ? undefined : loadedPluginModuleMap[fileURL];
  if (!loadedPluginModule) {
    try {
      loadedPluginModule = await import(fileURL);
    } catch (error) {
      if (!loadedPluginModule?.default) {
        loadedPluginModule = await commonjsLoader(fileURL);
      }
    }
    loadedPluginModuleMap[fileURL] = loadedPluginModule;
  }
  return loadedPluginModule;
}

export function registerPlugin(meta, lifecycles, refresh = false) {
  UI.ViewManager.registerViewExtension({
    ...meta,
    async loadView() {
      const plugin = await loadPluginModule(meta.url, refresh);
      if (refresh) {
        addDbClickEvent(meta);
      }
      return new PluginPanel(meta.title, plugin.default, meta.id, lifecycles);
    },
    title: () => meta.title,
  });
  if (refresh) {
    UI.ViewManager.ViewManager.instance({ forceNew: true });
    UI.ViewManager.ViewManager.instance().showViewInLocation(meta.id, "panel");
  }
}

function addDbClickEvent(meta) {
  UI.ViewManager.ViewManager.instance()
    .resolveLocation("panel")
    .then((l) => {
      l.tabbedPane()._currentTab._titleElement.addEventListener(
        "dblclick",
        () => {
          const widget = /** @type {!ContainerWidget} */ (
            l.tabbedPane().tabView(meta.id)
          );
          widget._materializePromise = null;
          l.removeView(UI.ViewManager.ViewManager.instance().view(meta.id));
          UI.ViewManager.ViewManager.instance().showViewInLocation(
            meta.id,
            "panel"
          );
          addDbClickEvent(meta);
        }
      );
    });
}
