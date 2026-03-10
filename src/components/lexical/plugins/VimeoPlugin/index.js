import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { useEffect } from 'react';

import { $createVimeoNode, VimeoNode } from '../../nodes/VimeoNode';

export const INSERT_VIMEO_COMMAND = createCommand('INSERT_VIMEO_COMMAND');

export default function VimeoPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VimeoNode])) {
      throw new Error('VimeoPlugin: VimeoNode not registered on editor');
    }

    return editor.registerCommand(
      INSERT_VIMEO_COMMAND,
      (payload) => {
        const vimeoNode = $createVimeoNode(payload);
        $insertNodeToNearestRoot(vimeoNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
