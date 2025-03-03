// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import Clipboard from 'clipboard';
import { forwardRef, ReactElement, useEffect } from 'react';

type CopyButtonProps = {
  id: string;
  content: string;
  toastText: string;
  button?: ReactElement;
};

export const CopyButton = ({ id, content, toastText, button }: CopyButtonProps) => {
  useEffect(() => {
    const copyButton = new Clipboard(`#${id}`, {
      text: () => `${content}`
    });
    copyButton.on('success', () => {
      message.success(toastText);
    });

    return () => {
      copyButton.destroy();
    };
  }, [content]);

  return <span id={id}>{button ?? <Button type="primary" icon={<CopyOutlined />} />}</span>;
};

// Encapsulate CopyButton for Tooltip component, for reasons, refer to the antd official website
export const TooltipCopyButton = forwardRef((props: CopyButtonProps, ref: any) => (
  <span {...props} ref={ref}>
    <CopyButton {...props} />
  </span>
));
