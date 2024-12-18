import { DecoratorNode } from "lexical";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export class HtmlEditorNode extends DecoratorNode {
  static getType() {
    return "html-editor";
  }

  static clone(node) {
    return new HtmlEditorNode(node.__html);
  }

  constructor(html = "") {
    super();
    this.__html = html;
  }

  exportJSON() {
    return {
      type: "html-editor",
      version: 1,
      html: this.__html,
    };
  }

  static importJSON(serializedNode) {
    return new HtmlEditorNode(serializedNode.html);
  }

  static clone(node) {
    return new HtmlEditorNode(node.__html);
  }

  createDOM() {
    const div = document.createElement("div");
    div.style.backgroundColor = "#f5f5f5";
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.borderRadius = "4px";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <HtmlEditorComponent html={this.__html} nodeKey={this.getKey()} />;
  }
  isInline() {
    return false; // Blok düzeyinde bir node
  }
  // Node boş bırakılırsa silinebilir
  canBeEmpty() {
    return true;
  }
}

// function HtmlEditorComponent({ html, nodeKey }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedHtml, setEditedHtml] = useState(html);
//   const [editor] = useLexicalComposerContext();
  
//   // const onComplete = () => {
   
//   //   editor.update(() => {
//   //     const node = editor.getNodeByKey(nodeKey);
//   //     if (node) node.__html = editedHtml;
//   //   });
//   //   setIsEditing(false);
//   // };

//   const onComplete = () => {
//     editor.update(() => {
//       const editorState = editor.getEditorState();
//       editorState.read(() => {
//         const node = editorState._nodeMap.get(nodeKey); // Node'u alın
//         if (node) {
//           const newNode = new HtmlEditorNode(editedHtml); // Yeni node oluştur
//           node.replace(newNode); // Eski node'u yenisiyle değiştir
//         }
//       });
//     });
//     setIsEditing(false);
//   };
  
  
  

//   const onDeleteNode = () => {
//     editor.update(() => {
//       const node = editor.getNodeByKey(nodeKey);
//       if (node) node.remove();
//     });
//   };

//   return isEditing ? (
//     <div>
//       <textarea
//         style={{ width: "100%", height: "100px", marginBottom: "10px" }}
//         value={editedHtml}
//         onChange={(e) => setEditedHtml(e.target.value)}
//       />
//       <button onClick={onComplete}>Tamamlandı</button>
//     </div>
//   ) : (
//     <div
//       onDoubleClick={() => setIsEditing(true)}
//       onKeyDown={(e) => {
//         if (e.key === "Delete" || e.key === "Backspace") {
//           e.preventDefault();
//           onDeleteNode();
//         }
//       }}
//       style={{ cursor: "pointer" }}
//       dangerouslySetInnerHTML={{ __html: editedHtml }}
//     />
//   );
// }

function HtmlEditorComponent({ html, nodeKey }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtml, setEditedHtml] = useState(html);
  const [editor] = useLexicalComposerContext();

  const onComplete = () => {
    editor.update(() => {
      const editorState = editor.getEditorState();
      const node = editorState._nodeMap.get(nodeKey); // Node'u doğrudan alın
      if (node) {
        const newNode = new HtmlEditorNode(editedHtml); // Yeni node oluştur
        node.replace(newNode); // Eski node'u yenisiyle değiştir
      }
    });
    setIsEditing(false);
  };

  const onDeleteNode = () => {
    editor.update(() => {
      const node = editor.getNodeByKey(nodeKey);
      if (node) node.remove();
    });
  };

  return isEditing ? (
    <div>
      <textarea
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
        value={editedHtml}
        onChange={(e) => setEditedHtml(e.target.value)}
      />
      <button onClick={onComplete}>Tamamlandı</button>
    </div>
  ) : (
    <div
      onDoubleClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onDeleteNode();
        }
      }}
      style={{ cursor: "pointer" }}
      dangerouslySetInnerHTML={{ __html: editedHtml }}
    />
  );
}
