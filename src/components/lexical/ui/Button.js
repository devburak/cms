/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './Button.css';

import React from 'react';
import joinClasses from '../utils/joinClasses';

function Button(props) {
  const {
    'data-test-id': dataTestId,
    children,
    className,
    onClick,
    disabled,
    small,
    title
  } = props;

  return (
    <button
      disabled={disabled}
      className={joinClasses(
        'Button__root',
        disabled && 'Button__disabled',
        small && 'Button__small',
        className
      )}
      onClick={onClick}
      title={title}
      aria-label={title}
      {...(dataTestId && {'data-test-id': dataTestId})}
    >
      {children}
    </button>
  );
}

export default Button;
