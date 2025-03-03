// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initStatistics } from './utils/statisticsUtils';

initStatistics();
ReactDOM.render(React.createElement(App), document.getElementById('root'));
