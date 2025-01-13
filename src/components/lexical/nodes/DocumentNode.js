// DocumentNode.js

import { DecoratorNode } from "lexical";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

/**
 * $createDocumentNode:
 *  - Yardımcı fonksiyon; kolayca DocumentNode oluşturmak için kullanırız.
 * $isDocumentNode:
 *  - Verilen node'un DocumentNode olup olmadığını kontrol eder.
 */
export function $createDocumentNode(link, filename) {
  return new DocumentNode(link, filename);
}

export function $isDocumentNode(node) {
  return node instanceof DocumentNode;
}

/**
 * DocumentNode:
 *  - "link" ve "filename" tutar, ekranda (decorate ile) bir React bileşeni olarak görünür.
 *  - exportDOM() metoduyla HTML çıktısı oluşturur (ör. exportToHTML).
 */
export class DocumentNode extends DecoratorNode {
  static getType() {
    return "document";
  }

  static clone(node) {
    return new DocumentNode(node.__link, node.__filename, node.__key);
  }

  constructor(link, filename, key) {
    super(key);
    this.__link = link;
    this.__filename = filename;
  }

  // -------------------------
  // 1) Serileştirme - JSON
  // -------------------------
  static importJSON(serializedNode) {
    const { link, filename } = serializedNode;
    return $createDocumentNode(link, filename);
  }

  exportJSON() {
    return {
      type: "document",
      version: 1,
      link: this.__link,
      filename: this.__filename,
    };
  }

  // ----------------------------------
  // 2) createDOM / updateDOM
  // ----------------------------------
  createDOM() {
    // Varsayılan olarak bir <div> döndürüyor (block-level).
    // Inline ekleme istiyorsanız <span> kullanabilirsiniz.
    const div = document.createElement("div");
    div.className = "document-node-container";
    return div;
  }

  updateDOM(prevNode, dom) {
    // Genellikle DecoratorNode için true/false döndürürsünüz.
    // İçerik değişimi yoksa "return false" yeterli.
    return false;
  }

  // ----------------------------------
  // 3) decorate():
  //     React bileşeni ile ekrana çiziliyor.
  // ----------------------------------
  decorate() {
    return (
      <DocumentComponent
        link={this.__link}
        filename={this.__filename}
      />
    );
  }

  // ----------------------------------
  // 4) exportDOM():
  //    EditorState'ten HTML çıkarmak istediğinizde kullanılır.
  // ----------------------------------
  exportDOM() {
    // 1) DocumentComponent React bileşeni
    const reactElement = (
      <DocumentComponent
        link={this.__link}
        filename={this.__filename}
      />
    );

    // 2) SSR render
    const htmlString = ReactDOMServer.renderToString(reactElement);

    // 3) Bir <div> oluşturarak HTML'i içine koyuyoruz
    const container = document.createElement("div");
    container.innerHTML = htmlString;
    container.className = "document-node-container";

    // 4) Lexical’ın beklediği obje:
    return {
      element: container,
    };
  }
}

/**
 * DocumentComponent:
 * - Ekranda beliren asıl React bileşeni.
 */
function DocumentComponent({ link, filename }) {
  const fileExtension = (filename || "").split(".").pop()?.toLowerCase() || "";
  const iconSrc = getFileIcon(fileExtension);

  return (
    <div style={{ display: "flex", alignItems: "center", margin: "2px 0" }}>
      <img
        src={iconSrc}
        alt="File Icon"
        style={{ width: "24px", height: "24px", marginRight: "8px" }}
      />
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "blue" }}
      >
        {filename}
      </a>
    </div>
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
      return "https://storage.ikon-x.com.tr/files/excel-file.png";
    default:
      return "https://storage.ikon-x.com.tr/files/default.png";
  }
}
