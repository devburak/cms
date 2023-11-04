// import "./index.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    BlockWithAlignableContents
  } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister, $getNodeByKey, $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW, DecoratorNode } from "lexical";
import * as React from "react";
import {useCallback} from "react";

function FileInputComponent({ nodeKey, text, fileUrl }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);


  // Node'u silme fonksiyonu
  const handleDelete = useCallback((event) => {
    event.preventDefault();
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isFileInputNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);
  

  const handleEdit = (event) => {
    event.preventDefault();
    const newNodeText = prompt("Yeni metni girin:", text);
    
    if (newNodeText) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        console.log("Returned Node:", node);
        debugger;
        if (node && $isFileInputNode(node)) {
          // Eğer FileInputNode sınıfında doğrudan bir updateText metodu yoksa,
          // bu adımda metni güncelleyebilirsiniz. Örneğin:
          // node._text = newNodeText;
          
          // Eğer varsa, bu metodu kullanabilirsiniz:
          node.updateText(newNodeText);
  
          // Sonrasında, eğer gerekliyse, editörü node'un güncellendiğine dair bilgilendirebilirsiniz.
          // Örneğin:
          // editor.updateNode(node);
        }
      });
    }
  };
  


  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <a href={fileUrl} data-key={nodeKey}>
        <strong>{text}</strong>
      </a>
      <button onClick={handleEdit} style={{ marginLeft: '10px' }}>Düzenle</button>
      <button onClick={handleDelete} style={{ marginLeft: '10px' }}>Sil</button>
    </div>
  );
}



export class FileInputNode extends DecoratorNode {
  constructor(nodeKey, text, fileUrl) {
    super(nodeKey);
    this.text = text;
    this.fileUrl = fileUrl;
  }

  // get text() {
  //   return this.text;
  // }

  // set text(value) {
  //   this.text = value;
  // }

  static getType() {
    return "file-input";
  }

  static clone(node) {
    return new FileInputNode(node.__key, node.text, node.fileUrl);
  }

  static importJSON(serializedNode) {
    return $createFileInputNode(serializedNode.text, serializedNode.fileUrl);
  }

  static importDOM() {
    
    return {
      a: domNode => {
        const tp = domNode.getAttribute("data-type");
        if (tp !== this.getType()) return null;

        return {
          conversion: convertFileInputElement,
          priority: COMMAND_PRIORITY_HIGH
        };
      }
    };
  }

  exportJSON() {
    return {
      type: this.getType(),
      text: this.text,
      fileUrl: this.fileUrl,
      version: 1
    };
  }

  createDOM() {
    const el = document.createElement("a");
    el.setAttribute("href", this.fileUrl);
    el.setAttribute("data-type", this.getType());
    // el.textContent = this.text;
    return el;
  }

  getTextContent() {
    return this.text;
  }
  updateText(newText) {
    const self = this.getWritable()
    self.text=newText;
    // this.text = newText;
    // DOM güncellemesi gerekiyorsa burada yapılabilir
  }

  isInline() {
    return true; // Link olduğu için inline olarak işaretledik.
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns
    }
    return false
  }

  decorate() {
    return <FileInputComponent nodeKey={this.__key} text={this.text} fileUrl={this.fileUrl} />;
  }
}

function convertFileInputElement(domNode) {
  const text = domNode.textContent;
  const fileUrl = domNode.getAttribute('href');
  return { node: $createFileInputNode(text, fileUrl) };
}

export function $createFileInputNode(text, fileUrl) {
  return new FileInputNode(null, text, fileUrl);
}

export function $isFileInputNode(node) {

  console.log("Inside $isFileInputNode:", FileInputNode);
  console.log("isFileInput:", (node instanceof FileInputNode))
  return node instanceof FileInputNode;
}
