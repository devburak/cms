// DocumentNode.js

import { DecoratorNode, $getNodeByKey, $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical";
import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import useModal from "../hooks/useModal";
import Button from "../ui/Button";
import { DialogActions } from "../ui/Dialog";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";

/**
 * $createDocumentNode:
 *  - Yardımcı fonksiyon; kolayca DocumentNode oluşturmak için kullanırız.
 * $isDocumentNode:
 *  - Verilen node'un DocumentNode olup olmadığını kontrol eder.
 */
export function $createDocumentNode(link, filename, metaText = '', displayText = '', target = '_blank', showIcon = true) {
  return new DocumentNode(link, filename, metaText, displayText, target, showIcon);
}

export function $isDocumentNode(node) {
  return node instanceof DocumentNode;
}

/**
 * DocumentNode:
 *  - "link", "filename", "displayText", "target", "showIcon" tutar
 *  - Ekranda (decorate ile) bir React bileşeni olarak görünür.
 *  - exportDOM() metoduyla HTML çıktısı oluşturur.
 */
export class DocumentNode extends DecoratorNode {
  static getType() {
    return "document";
  }

  static clone(node) {
    return new DocumentNode(
      node.__link,
      node.__filename,
      node.__metaText,
      node.__displayText,
      node.__target,
      node.__showIcon,
      node.__key
    );
  }

  constructor(link, filename, metaText = '', displayText = '', target = '_blank', showIcon = true, key) {
    super(key);
    this.__link = link;
    this.__filename = filename;
    this.__metaText = metaText;
    this.__displayText = displayText || filename;
    this.__target = target;
    this.__showIcon = showIcon;
  }

  // Getter metodları
  getLink() { return this.__link; }
  getFilename() { return this.__filename; }
  getMetaText() { return this.__metaText; }
  getDisplayText() { return this.__displayText; }
  getTarget() { return this.__target; }
  getShowIcon() { return this.__showIcon; }

  // Update metodu - düzenleme için
  update(payload) {
    const writable = this.getWritable();
    if (payload.link !== undefined) writable.__link = payload.link;
    if (payload.displayText !== undefined) writable.__displayText = payload.displayText;
    if (payload.target !== undefined) writable.__target = payload.target;
    if (payload.showIcon !== undefined) writable.__showIcon = payload.showIcon;
    if (payload.metaText !== undefined) writable.__metaText = payload.metaText;
  }

  // -------------------------
  // 1) Serileştirme - JSON
  // -------------------------
  static importJSON(serializedNode) {
    const { link, filename, metaText = '', displayText = '', target = '_blank', showIcon = true } = serializedNode;
    return $createDocumentNode(link, filename, metaText, displayText, target, showIcon);
  }

  exportJSON() {
    return {
      type: "document",
      version: 1,
      link: this.__link,
      filename: this.__filename,
      metaText: this.__metaText,
      displayText: this.__displayText,
      target: this.__target,
      showIcon: this.__showIcon
    };
  }

  // ----------------------------------
  // 2) createDOM / updateDOM
  // ----------------------------------
  createDOM() {
    const div = document.createElement("div");
    div.className = "document-node-container";
    return div;
  }

  updateDOM() {
    return false;
  }

  // ----------------------------------
  // 3) decorate():
  //     React bileşeni ile ekrana çiziliyor.
  // ----------------------------------
  decorate() {
    return (
      <DocumentComponent
        nodeKey={this.__key}
        link={this.__link}
        filename={this.__filename}
        metaText={this.__metaText}
        displayText={this.__displayText}
        target={this.__target}
        showIcon={this.__showIcon}
      />
    );
  }

  // ----------------------------------
  // 4) exportDOM():
  //    EditorState'ten HTML çıkarmak istediğinizde kullanılır.
  //    DOM API kullanılır - React component kullanılmaz (SSR hook sorunu önlenir)
  // ----------------------------------
  exportDOM() {
    const displayText = this.__displayText || this.__filename;
    const fileExtension = (this.__filename || "").split(".").pop()?.toLowerCase() || "";
    const iconSrc = getFileIcon(fileExtension);

    const container = document.createElement("div");
    container.className = "document-node-container";
    container.style.cssText = "display: flex; align-items: flex-start; margin: 2px 0;";

    if (this.__showIcon !== false) {
      const icon = document.createElement("img");
      icon.src = iconSrc;
      icon.alt = "File Icon";
      icon.style.cssText = "width: 24px; height: 24px; margin-right: 8px; margin-top: 2px;";
      container.appendChild(icon);
    }

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display: flex; flex-direction: column; gap: 2px;";

    const anchor = document.createElement("a");
    anchor.href = this.__link;
    anchor.target = this.__target || "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.cssText = "text-decoration: none; color: blue;";
    anchor.textContent = displayText;
    wrapper.appendChild(anchor);

    if (this.__metaText) {
      const meta = document.createElement("span");
      meta.style.cssText = "font-size: 12px; color: #6b7280;";
      meta.textContent = this.__metaText;
      wrapper.appendChild(meta);
    }

    container.appendChild(wrapper);
    return { element: container };
  }
}

/**
 * UpdateDocumentDialog:
 * - Dosya düzenleme modal içeriği
 */
export function UpdateDocumentDialog({ activeEditor, nodeKey, onClose }) {
  const editorState = activeEditor.getEditorState();
  const node = editorState.read(() => $getNodeByKey(nodeKey));
  
  const [link, setLink] = useState(node?.getLink() || '');
  const [displayText, setDisplayText] = useState(node?.getDisplayText() || node?.getFilename() || '');
  const [target, setTarget] = useState(node?.getTarget() || '_blank');
  const [showIcon, setShowIcon] = useState(node?.getShowIcon() ?? true);
  const [metaText, setMetaText] = useState(node?.getMetaText() || '');

  const handleOnConfirm = () => {
    if (node) {
      activeEditor.update(() => {
        node.update({ link, displayText, target, showIcon, metaText });
      });
    }
    onClose();
  };

  return (
    <React.Fragment>
      <div style={{ marginBottom: '1em' }}>
        <TextInput
          label="Link (URL)"
          placeholder="https://example.com/file.pdf"
          onChange={setLink}
          value={link}
        />
      </div>
      <div style={{ marginBottom: '1em' }}>
        <TextInput
          label="Görünen Metin"
          placeholder="Dosya adı veya açıklama"
          onChange={setDisplayText}
          value={displayText}
        />
      </div>
      <div style={{ marginBottom: '1em' }}>
        <TextInput
          label="Meta Bilgi (opsiyonel)"
          placeholder="Dosya boyutu, tarih vb."
          onChange={setMetaText}
          value={metaText}
        />
      </div>
      <Select
        style={{ marginBottom: '1em', width: '208px' }}
        value={target}
        label="Açılma Yeri"
        name="target"
        id="target-select"
        onChange={(e) => setTarget(e.target.value)}
      >
        <option value="_blank">Yeni Sekmede Aç</option>
        <option value="_self">Aynı Sekmede Aç</option>
      </Select>
      <div className="Input__wrapper" style={{ marginBottom: '1em' }}>
        <input
          id="showIcon"
          type="checkbox"
          checked={showIcon}
          onChange={(e) => setShowIcon(e.target.checked)}
        />
        <label htmlFor="showIcon" style={{ marginLeft: '8px' }}>Dosya İkonu Göster</label>
      </div>
      <DialogActions>
        <Button onClick={handleOnConfirm}>Kaydet</Button>
      </DialogActions>
    </React.Fragment>
  );
}

/**
 * DocumentComponent:
 * - Ekranda beliren asıl React bileşeni.
 * - Seçim, silme ve düzenleme özellikleri içerir.
 */
function DocumentComponent({ nodeKey, link, filename, metaText, displayText, target, showIcon }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [modal, showModal] = useModal();
  const containerRef = useRef(null);

  const fileExtension = (filename || "").split(".").pop()?.toLowerCase() || "";
  const iconSrc = getFileIcon(fileExtension);
  const display = displayText || filename;

  const onDelete = useCallback(
    (payload) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        payload.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isDocumentNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          if (containerRef.current && containerRef.current.contains(event.target)) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [editor, isSelected, setSelected, clearSelection, onDelete]);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showModal("Dosya Düzenle", (onClose) => (
      <UpdateDocumentDialog
        activeEditor={editor}
        nodeKey={nodeKey}
        onClose={onClose}
      />
    ));
  };

  return (
    <>
      {modal}
      <div
        ref={containerRef}
        className={`document-component ${isSelected ? 'selected' : ''}`}
        style={{
          display: "flex",
          alignItems: "flex-start",
          margin: "2px 0",
          padding: "4px 8px",
          borderRadius: "4px",
          border: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
          backgroundColor: isSelected ? "#eff6ff" : "transparent",
          cursor: "pointer",
          position: "relative"
        }}
      >
        {showIcon !== false && (
          <img
            src={iconSrc}
            alt="File Icon"
            style={{ width: "24px", height: "24px", marginRight: "8px", marginTop: "2px" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          <a
            href={link}
            target={target}
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "blue" }}
            onClick={(e) => { if (isSelected) e.preventDefault(); }}
          >
            {display}
          </a>
          {metaText && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {metaText}
            </span>
          )}
        </div>
        {isSelected && (
          <button
            onClick={handleEdit}
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
            title="Düzenle"
          >
            ✏️
          </button>
        )}
      </div>
    </>
  );
}

/**
 * getFileIcon:
 *  - Dosya uzantısına göre ikon seçelim (PDF, Word, Excel vb.)
 */
function getFileIcon(ext) {
  switch (ext) {
    case "pdf":
      return "https://storage.ikon-x.com.tr/files/pdf.png";
    case "doc":
    case "docx":
      return "https://storage.ikon-x.com.tr/files/word.png";
    case "xlsx":
    case "xls":
      return "https://storage.ikon-x.com.tr/files/excel-file.png";
    default:
      return "https://storage.ikon-x.com.tr/files/default.png";
  }
}
