import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
// import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// import { TablePlugin } from '@lexical/react/LexicalTablePlugin'; 
// import { TableCellResizer } from '@lexical/react/LexicalTableCellResizerPlugin';
// import { LexicalClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import ClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin'; // Custom plugin
// import EmojiPickerPlugin from './plugins/EmojiPickerPlugin'; // Custom plugin
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'; // Custom plugin
// import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin'; // Custom plugin
import PollPlugin from './plugins/PollPlugin'; // Custom plugin
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin'; // Custom plugin

import { createWebsocketProvider } from './collaboration';
import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import Placeholder from './ui/Placeholder';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
const Editor = React.forwardRef((props, ref) => {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();

  const isEditable = useLexicalEditable();
  const placeholderText = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...';
  const placeholder = <Placeholder>{placeholderText}</Placeholder>;

  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState(true);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport = typeof window !== 'undefined' && window.matchMedia('(max-width: 1025px)').matches;
      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };

    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);
    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'Playground',
        theme: PlaygroundEditorTheme,
        editable: true,
        onError: (error) => {
          throw error;
        },
      }}
    >
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div className={`editor-container ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}`}>
        {isMaxLength && <CharacterLimitPlugin maxLength={30} />}
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <CheckListPlugin />
        {/* <EmojiPickerPlugin /> */}
        <AutoEmbedPlugin />
        <HashtagPlugin />
        <HorizontalRulePlugin />
        {/* <ListPlugin /> */}
        <LinkPlugin />
        <PollPlugin />
        <ExcalidrawPlugin />
        <RichTextPlugin
          contentEditable={<div className="editor-scroller"><div className="editor" ref={onRef}><ContentEditable /></div></div>}
          placeholder={placeholder}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CodeHighlightPlugin />
        <TablePlugin
          hasCellMerge={tableCellMerge}
          hasCellBackgroundColor={tableCellBackgroundColor}
        />
        <TablePlugin />
        {/* <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} /> */}
        <HistoryPlugin externalHistoryState={historyState} />
        {!isEditable && <ClickableLinkPlugin />}
        {isAutocomplete && <AutocompletePlugin />}
      </div>
    </LexicalComposer>
  );
});

export default Editor;