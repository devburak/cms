/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default function caretFromPoint(x, y) {
    if (typeof document.caretRangeFromPoint !== 'undefined') {
      const range = document.caretRangeFromPoint(x, y);
      if (range === null) {
        return null;
      }
      return {
        node: range.startContainer,
        offset: range.startOffset,
      };
    } else if (typeof document.caretPositionFromPoint !== 'undefined') {
      const range = document.caretPositionFromPoint(x, y);
      if (range === null) {
        return null;
      }
      return {
        node: range.offsetNode,
        offset: range.offset,
      };
    } else {
      // Gracefully handle IE
      return null;
    }
  }
  