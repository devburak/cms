import React, { useState,useEffect } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import { $createFileInputNode, FileInputNode, $isFileInputNode } from "../../nodes/FileInputNode";

export const INSERT_FILE_INPUT = createCommand();

export default function FileInputPlugin({ isOpen, onClose }) {
  const [editor] = useLexicalComposerContext();
//   const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (!editor.hasNodes([FileInputNode])) {
      throw new Error('FileInputPlugin: FileInputNode not registered on editor (initialConfig.nodes)');
    }

    return editor.registerCommand(
        INSERT_FILE_INPUT,
      () => {
        const fileInputNode = $createFileInputNode(text, fileUrl);
        $insertNodeToNearestRoot(fileInputNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, text, fileUrl]);

  const handleSubmit = () => {
    editor.update(() => {
        const fileInput = $createFileInputNode(text, fileUrl);
        $insertNodeToNearestRoot(fileInput);
      });
  
      onClose();
    //   setText('');
    //   setFileUrl('');
  };

  return (
    <>
      {isOpen && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <div>
            <label>
              Link Text:
              <input value={text} onChange={(e) => setText(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              File URL:
              <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            </label>
          </div>
          <button onClick={handleSubmit}>Add to Editor</button>
          <button onClick={() => onClose()}>Cancel</button>
        </div>
      )}
    </>
  );
}
