import React, { useState, useEffect } from 'react';
import FileViewer from './fileviewer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from '../lexical/plugins/ImagesPlugin';
import { registerCarouselCommand, INSERT_CAROUSEL_COMMAND } from './CarouselNode';
import { INSERT_DOCUMENT_COMMAND } from '../lexical/plugins/DocumentsPlugin';
import { buildFileMeta, isImageFile } from '../../utils/file';

function InsertFilePlugin({ onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editor] = useLexicalComposerContext();

  const isSelected = (file) => {
    return selectedFiles.some((selectedFile) => selectedFile._id === file._id);
  };

  const handleFileSelect = (file) => {
    if (isSelected(file)) {
      setSelectedFiles((prev) => prev.filter((selectedFile) => selectedFile._id !== file._id));
    } else {
      setSelectedFiles((prev) => [...prev, file]);
    }
  };

  const insertImageNode = (file, meta) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      resizable: true,
      maxWidth: 600,
      width: 'inherit',
      height: 'auto',
      src: file.url,
      altText: file.altText || file.originalName || file.filename || 'selected image',
      metaText: meta.summary
    });
  };

  const insertDocumentNode = (file, meta) => {
    editor.dispatchCommand(INSERT_DOCUMENT_COMMAND, {
      link: file.url,
      filename: file?.originalName || 'Untitled Document',
      metaText: meta.summary
    });
  };

  const insertContent = async () => {
    if (selectedFiles.length === 0) {
      onClose();
      return;
    }

    const filesWithMeta = await Promise.all(
      selectedFiles.map(async (file) => ({
        file,
        meta: await buildFileMeta(file)
      }))
    );

    if (filesWithMeta.length === 1) {
      const { file, meta } = filesWithMeta[0];
      if (isImageFile(file)) {
        insertImageNode(file, meta);
      } else {
        insertDocumentNode(file, meta);
      }
      onClose();
      return;
    }

    const imageFiles = [];
    const documentFiles = [];

    filesWithMeta.forEach((entry) => {
      if (isImageFile(entry.file)) {
        imageFiles.push(entry);
      } else {
        documentFiles.push(entry);
      }
    });

    documentFiles.forEach(({ file, meta }) => insertDocumentNode(file, meta));

    if (imageFiles.length === 1) {
      const { file, meta } = imageFiles[0];
      insertImageNode(file, meta);
    } else if (imageFiles.length > 1) {
      const carouselSlides = imageFiles.map(({ file, meta }) => ({
        src: file.url,
        altText: file.altText || file.originalName || 'carousel slide',
        metaText: meta.summary
      }));
      editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, { images: carouselSlides });
    }

    onClose();
  };

  useEffect(() => {
    return registerCarouselCommand(editor);
  }, [editor]);

  return (
    <div style={{ maxWidth: '90%' }}>
      <FileViewer
        onFileSelect={handleFileSelect}
        multiSelect={true}
        funcButton={{
          text: 'Dosya(lar) Ekle',
          onClick: insertContent
        }}
      />
    </div>
  );
}

export default InsertFilePlugin;
