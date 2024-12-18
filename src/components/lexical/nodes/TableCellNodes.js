

import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {HashtagNode} from '@lexical/hashtag';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';

import {AutocompleteNode} from './AutocompleteNode';
import {EmojiNode} from './EmojiNode';
import {EquationNode} from './EquationNode';
// import {ExcalidrawNode} from './ExcalidrawNode';
import {ImageNode} from './ImageNode';
import {KeywordNode} from './KeywordNode';
import {MentionNode} from './MentionNode';
import { HtmlEditorNode } from "./HtmlEditorNode";

const PlaygroundNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  ImageNode,
  MentionNode,
  EmojiNode,
  EquationNode,
  AutocompleteNode,
  KeywordNode,
  HtmlEditorNode
];

export default PlaygroundNodes;
