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

console.warn(
    "If you are profiling the playground app, please ensure you turn off the debug view. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting."
)

function prepopulatedRichText() {
    const root = $getRoot()
    if (root.getFirstChild() === null) {
        const heading = $createHeadingNode("h1")
        heading.append($createTextNode("Welcome to the playground"))
        root.append(heading)
        const quote = $createQuoteNode()
        quote.append(
            $createTextNode(
                `In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. ` +
                `You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.`
            )
        )
        root.append(quote)
        const paragraph = $createParagraphNode()
        paragraph.append(
            $createTextNode("The playground is a demo environment built with "),
            $createTextNode("@lexical/react").toggleFormat("code"),
            $createTextNode("."),
            $createTextNode(" Try typing in "),
            $createTextNode("some text").toggleFormat("bold"),
            $createTextNode(" with "),
            $createTextNode("different").toggleFormat("italic"),
            $createTextNode(" formats.")
        )
        root.append(paragraph)
        const paragraph2 = $createParagraphNode()
        paragraph2.append(
            $createTextNode(
                "Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!"
            )
        )
        root.append(paragraph2)
        const paragraph3 = $createParagraphNode()
        paragraph3.append(
            $createTextNode(`If you'd like to find out more about Lexical, you can:`)
        )
        root.append(paragraph3)
        const list = $createListNode("bullet")
        list.append(
            $createListItemNode().append(
                $createTextNode(`Visit the `),
                $createLinkNode("https://lexical.dev/").append(
                    $createTextNode("Lexical website")
                ),
                $createTextNode(` for documentation and more information.`)
            ),
            $createListItemNode().append(
                $createTextNode(`Check out the code on our `),
                $createLinkNode("https://github.com/facebook/lexical").append(
                    $createTextNode("GitHub repository")
                ),
                $createTextNode(`.`)
            ),
            $createListItemNode().append(
                $createTextNode(`Playground code can be found `),
                $createLinkNode(
                    "https://github.com/facebook/lexical/tree/main/packages/lexical-playground"
                ).append($createTextNode("here")),
                $createTextNode(`.`)
            ),
            $createListItemNode().append(
                $createTextNode(`Join our `),
                $createLinkNode("https://discord.com/invite/KmG4wQnnD9").append(
                    $createTextNode("Discord Server")
                ),
                $createTextNode(` and chat with the team.`)
            )
        )
        root.append(list)
        const paragraph4 = $createParagraphNode()
        paragraph4.append(
            $createTextNode(
                `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`
            )
        )
        root.append(paragraph4)
    }
}

function Playground() {
    const {
        settings: { isCollab, emptyEditor, measureTypingPerf }
    } = useSettings();

    const editorRef = useRef(null);
    const [currentEditorState, setCurrentEditorState] = useState(null);

    const initialConfig = {
        editorState: isCollab
            ? null
            : emptyEditor
                ? undefined
                : prepopulatedRichText,
        namespace: "Playground",
        nodes: [...PlaygroundNodes],
        onError: error => {
            throw error;
        },
        theme: PlaygroundEditorTheme
    };

    const handleButtonClick = () => {

        if (editorRef.current) {
            const editorContent = editorRef.current.read();
            setCurrentEditorState(editorContent);
            console.log(editorContent);
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            const editorState = editorRef.current.state;
            setCurrentEditorState(editorState);
        }
    }, [editorRef.current]);

    return (
        <>
        <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
                <TableContext>
                    <SharedAutocompleteContext>
                        <div className="editor-shell">
                        <Editor ref={editorRef} />
                        </div>
                  
                        {isDevPlayground ? <PasteLogPlugin /> : null}
                        {isDevPlayground ? <TestRecorderPlugin /> : null}
                        {measureTypingPerf ? <TypingPerfPlugin /> : null}
                    </SharedAutocompleteContext>
                </TableContext>
            </SharedHistoryContext>
                <OnChangePlugin
                    onChange={editorState => {
                        editorState.read(() => {
                            // write to database, local storage, etc.
                            console.log(editorState.toJSON())
                            const value = JSON.stringify(editorState); // or JSON.stringify(editorState.toJSON())
                            console.log(value);
                        });
                    }}
                />
        </LexicalComposer>
        
            <div>
                <button onClick={handleButtonClick}>Get Editor Content</button>
                <pre>{JSON.stringify(currentEditorState, null, 2)}</pre>
            </div>

        </>
    );
}

export default Playground;
