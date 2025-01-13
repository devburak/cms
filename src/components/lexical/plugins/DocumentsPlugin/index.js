import React, { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    createCommand,
    COMMAND_PRIORITY_EDITOR,
    $getSelection,
    $isRangeSelection,
  } from "lexical";
import { $getRoot } from "lexical";
import { $createDocumentNode, DocumentNode } from "../../nodes/DocumentNode";

// Komutu oluştur
export const INSERT_DOCUMENT_COMMAND = createCommand("INSERT_DOCUMENT_COMMAND");


export default function DocumentsInlinePlugin() {
    const [editor] = useLexicalComposerContext();
  
    useEffect(() => {
      return editor.registerCommand(
        INSERT_DOCUMENT_COMMAND,
        ({ link, filename }) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Seçili yere ekle
              const docNode = $createDocumentNode(link, filename);
              selection.insertNodes([docNode]);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      );
    }, [editor]);
  
    return null;
  }


/** registerDocumentCommand:
 *  Bu fonksiyonu istediğiniz bileşende çağırabilirsiniz.
 */
export function registerDocumentCommand(editor) {
    return editor.registerCommand(
      INSERT_DOCUMENT_COMMAND,
      ({ link, filename }) => {
        editor.update(() => {
          const root = $getRoot();
          const documentNode = $createDocumentNode(link, filename);
          root.append(documentNode);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }