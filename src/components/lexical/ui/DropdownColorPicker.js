/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import ColorPicker from './ColorPicker';
import DropDown from './DropDown';

function DropdownColorPicker(props) {
  const {
    disabled = false,
    stopCloseOnClickSelf = true,
    color,
    onChange,
    ...rest
  } = props;

  return (
    <DropDown
      {...rest}
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}>
      <ColorPicker color={color} onChange={onChange} />
    </DropDown>
  );
}

export default DropdownColorPicker;
