import { $createLinkNode } from "@lexical/link"
import { $createListItemNode, $createListNode } from "@lexical/list"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $createParagraphNode, $createTextNode, $getRoot , EditorState } from "lexical"
import React , { useState, useRef, useEffect } from 'react';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { TableContext } from "./plugins/TablePlugin";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import Editor from "./Editor";
import logo from "./images/logo.svg";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import Settings from "./Settings";
import DocsPlugin from "./plugins/DocsPlugin";
import PasteLogPlugin from "./plugins/PasteLogPlugin";
import TestRecorderPlugin from "./plugins/TestRecorderPlugin";
import TypingPerfPlugin from "./plugins/TypingPerfPlugin";
import { useSettings } from "./context/SettingsContext";
import { isDevPlayground } from "./appSettings"
import {EditorRefPlugin} from '@lexical/react/LexicalEditorRefPlugin'
console.warn(
    "If you are profiling the playground app, please ensure you turn off the debug view. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting."
)


function Playground( {content ,onContentChange}) {
    const {
        settings: { isCollab, emptyEditor, measureTypingPerf }
    } = useSettings();

    const editorRef = useRef(null);
    const [currentEditorState, setCurrentEditorState] = useState(null);

    const initialConfig = {
        editorState: emptyEditor,
        namespace: "Playground",
        nodes: [...PlaygroundNodes],
        onError: error => {
            throw error;
        },
        theme: PlaygroundEditorTheme,
        editable:true
    };

    const handleButtonClick = () => {

        if (editorRef.current) {
            const editorContent = editorRef.current.read();
            setCurrentEditorState(editorContent);
            console.log(editorContent);
        }
    };

 
    useEffect(() => {
        if (editorRef.current && content) {
          editorRef.current.update(() => {
            try {
              const editorState = EditorState.createFromJSON(content);
              editorRef.current.setEditorState(editorState);
            } catch (error) {
              console.error('Invalid JSON content:', error);
            }
          });
        }
      }, [content]);

    const handleChange = (editorState) => {
        editorState.read(() => {
            const jsonContent = editorState.toJSON();
            if (onContentChange) {
                onContentChange(JSON.stringify(jsonContent));
            }
        });
    };

    return (
        <>
        <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <EditorRefPlugin editorRef={editorRef} /> {/* Editor referansını günceller */}
            <div className="editor-shell">
            <Editor ref={editorRef} />
            </div>
            <OnChangePlugin onChange={handleChange} />
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
        
          

        </>
    );
}

export default Playground;
