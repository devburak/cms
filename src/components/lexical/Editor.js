// Editor.jsx

import React, { useEffect, useState } from 'react';
import { CAN_USE_DOM } from './shared/canUseDom';
import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';

// Lexical ve Plugin importları
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import DocumentsPlugin from './plugins/DocumentsPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import LinkPlugin from './plugins/LinkPlugin';
import PollPlugin from './plugins/PollPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import HtmlEditorPlugin from './plugins/HtmlEditorPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import ActionsPlugin from './plugins/ActionsPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import { createWebsocketProvider } from './collaboration';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';

const skipCollaborationInit =
  window.parent != null && window.parent.frames.right === window;

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
      tableHorizontalScroll,
    },
  } = useSettings();

  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState(true);

  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
      ? 'Enter some rich text...'
      : 'Enter some plain text...';

  const placeholder = <Placeholder>{text}</Placeholder>;

  const onRef = (elem) => {
    if (elem !== null) {
      setFloatingAnchorElem(elem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      if (CAN_USE_DOM) {
        const isNextSmallWidthViewport = window.matchMedia('(max-width: 1025px)').matches;
        if (isNextSmallWidthViewport !== isSmallWidthViewport) {
          setIsSmallWidthViewport(isNextSmallWidthViewport);
        }
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);
    return () => window.removeEventListener('resize', updateViewPortWidth);
  }, [isSmallWidthViewport]);

  return (
    <>
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !isRichText ? 'plain-text' : ''
        }`}
      >
        {/* Karakter limiti örneği */}
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}

        {/* Temel eklentiler */}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <DocumentsPlugin />

        {/* Rich Text ise... */}
        {isRichText ? (
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}

            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CodeHighlightPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
              hasHorizontalScroll={tableHorizontalScroll}
            />
            <TableCellResizer />
            <ImagesPlugin />
            <InlineImagePlugin />
            <LinkPlugin />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <HtmlEditorPlugin />
            {!isEditable && <LexicalClickableLinkPlugin />}
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <ExcalidrawPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />

            {/* Yüzen toolbar, context menüler, vb. */}
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge />
                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable />}
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}

        {/* UTF-16 / UTF-8 karakter limit seçeneği */}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}

        {showTableOfContents && <TableOfContentsPlugin />}
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        <ActionsPlugin isRichText={isRichText} />
      </div>
    </>
  );
});

export default Editor;
