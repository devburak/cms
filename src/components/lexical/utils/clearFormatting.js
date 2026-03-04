import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode"
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text"
import { $getNearestBlockElementAncestorOrThrow } from "@lexical/utils"
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode
} from "lexical"

export function clearFormattingSelection(editor) {
  editor.update(() => {
    const selection = $getSelection()

    if (!$isRangeSelection(selection)) {
      return
    }

    const { anchor, focus } = selection
    const nodes = selection.getNodes()

    if (anchor.key === focus.key && anchor.offset === focus.offset) {
      return
    }

    const isBackward = selection.isBackward()
    const startOffset = isBackward ? focus.offset : anchor.offset
    const endOffset = isBackward ? anchor.offset : focus.offset

    nodes.forEach((currentNode, index) => {
      let node = currentNode

      // Split edge nodes so formatting is cleared only inside the selection.
      if ($isTextNode(node)) {
        if (index === 0 && startOffset !== 0) {
          node = node.splitText(startOffset)[1] || node
        }

        if (index === nodes.length - 1) {
          node = node.splitText(endOffset)[0] || node
        }

        if (node.__style !== "") {
          node.setStyle("")
        }

        if (node.__format !== 0) {
          node.setFormat(0)
          $getNearestBlockElementAncestorOrThrow(node).setFormat("")
        }

        return
      }

      if ($isHeadingNode(node) || $isQuoteNode(node)) {
        node.replace($createParagraphNode(), true)
        return
      }

      if ($isDecoratorBlockNode(node)) {
        node.setFormat("")
      }
    })
  })
}
