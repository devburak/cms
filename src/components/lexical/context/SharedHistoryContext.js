/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createEmptyHistoryState } from '@lexical/react/LexicalHistoryPlugin';
import React from 'react';

const Context = React.createContext({});

export const SharedHistoryContext = ({ children }) => {
  const historyContext = React.useMemo(
    () => ({ historyState: createEmptyHistoryState() }),
    []
  );
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = () => {
  return React.useContext(Context);
};
