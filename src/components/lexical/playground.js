import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes } from "@lexical/html";
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from 'lexical';
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import Editor from './Editor';

function Playground({ initialContent, getContent }) {
  const [editor] = useLexicalComposerContext();
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {
    if (initialContent && !isContentLoaded) {
      setTimeout(() => {
      editor.update(() => {
        try {
          // Boş veya geçersiz JSON içerik varsa burada kontrol ediyoruz.
          if (typeof initialContent === 'string' && initialContent.trim().startsWith('{')) {
            const editorState = editor.parseEditorState(initialContent);
            editor.setEditorState(editorState);
          }else if (typeof initialContent === 'string' && initialContent.trim().startsWith('<')){
             // Eğer içerik bir HTML ise
             const parser = new DOMParser();
             const dom = parser.parseFromString(initialContent, 'text/html'); // HTML string'i parse et
             const nodes = $generateNodesFromDOM(editor, dom); // Lexical düğümleri oluştur
            // Select the root
            $getRoot().select();

            // Insert them at a selection.
            $insertNodes(nodes);
          }
           else {
            console.error("Invalid initial content format. It should be a JSON string.");
          }
        } catch (error) {
          console.error('Invalid JSON content:', error);
        }
      });
      setIsContentLoaded(true);
    }, 0); // Mikro görev kuyruğuna eklemek için 0 ms gecikme
    }
    
  }, [initialContent, editor, isContentLoaded]);

  const handleChange = (editorState) => {
    editorState.read(() => {
      const jsonContent = editorState.toJSON();
      const htmlContent = $generateHtmlFromNodes(editor);
      if (getContent) {
        getContent({
          json: JSON.stringify(jsonContent),
          html: htmlContent
        });
      }
    });
  };

  return (
    <div className="editor-shell">
        <Editor />
        <OnChangePlugin onChange={handleChange} />
      {/* <RichTextPlugin
        contentEditable={<ContentEditable className="editor-content" />}
        placeholder={<div>Start typing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      /> */}

      <OnChangePlugin onChange={handleChange} />
    </div>
  );
}

export default function EditorWrapper({ initialContent, getContent }) {
  const initialConfig = {
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error) => {
      throw error;
    },
    theme: {}, // Lexical temanız
    editable: true,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Playground initialContent={initialContent} getContent={getContent} />
    </LexicalComposer>
  );
}
