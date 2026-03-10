import {
  BlockWithAlignableContents
} from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode';
import React from 'react';

function VimeoComponent({
  className,
  format,
  nodeKey,
  videoID
}) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <iframe
        width="640"
        height="360"
        src={`https://player.vimeo.com/video/${videoID}`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen={true}
        title="Vimeo video"
      />
    </BlockWithAlignableContents>
  );
}

function convertVimeoElement(domNode) {
  const videoID = domNode.getAttribute('data-lexical-vimeo');
  if (videoID) {
    const node = $createVimeoNode(videoID);
    return { node };
  }
  return null;
}

export class VimeoNode extends DecoratorBlockNode {
  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }

  static getType() {
    return 'vimeo';
  }

  static clone(node) {
    return new VimeoNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createVimeoNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'vimeo',
      version: 1,
      videoID: this.__id,
    };
  }

  exportDOM() {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-vimeo', this.__id);
    element.setAttribute('width', '640');
    element.setAttribute('height', '360');
    element.setAttribute('src', `https://player.vimeo.com/video/${this.__id}`);
    element.setAttribute('frameborder', '0');
    element.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write');
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'Vimeo video');
    return { element };
  }

  static importDOM() {
    return {
      iframe: (domNode) => {
        if (!domNode.hasAttribute('data-lexical-vimeo')) {
          return null;
        }
        return {
          conversion: convertVimeoElement,
          priority: 1
        };
      }
    };
  }

  updateDOM() {
    return false;
  }

  getId() {
    return this.__id;
  }

  getTextContent() {
    return `https://vimeo.com/${this.__id}`;
  }

  decorate(editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || ''
    };
    return (
      <VimeoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export function $createVimeoNode(videoID) {
  return new VimeoNode(videoID);
}

export function $isVimeoNode(node) {
  return node instanceof VimeoNode;
}
