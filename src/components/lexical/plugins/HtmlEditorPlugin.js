import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HtmlEditorNode } from "../nodes/HtmlEditorNode";
import { $getRoot, $createParagraphNode } from "lexical";

export default function HtmlEditorPlugin() {
  const [editor] = useLexicalComposerContext();

  const insertHtmlEditorNode = () => {
    editor.update(() => {
      const htmlNode = new HtmlEditorNode("<p>Buraya HTML içeriğinizi ekleyin</p>");
      const root = $getRoot();
      root.append(htmlNode);
    });
  };

  return (
    null
  );
}
