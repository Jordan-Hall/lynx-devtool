// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export const downloadAsFile = (content: string, fileName: string, mimeType: string = 'text/plain') => {
  const file = new File([content], fileName, { type: mimeType });
  const url = URL.createObjectURL(file);

  const linkElement = document.createElement('a');
  linkElement.style.display = 'none';
  linkElement.href = url;
  linkElement.download = fileName;
  document.body.appendChild(linkElement);
  linkElement.click();
  linkElement.remove();
  URL.revokeObjectURL(url);
};
