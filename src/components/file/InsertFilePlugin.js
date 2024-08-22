// InsertFilePlugin.jsx
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FileViewer from './fileviewer'; // Doğru yolu kullanın
import { maxWidth } from '@mui/system';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {INSERT_IMAGE_COMMAND} from '../lexical/plugins/ImagesPlugin';

function InsertFilePlugin( {onClose}) {
    const [isFileViewerOpen, setFileViewerOpen] = useState(true);
    const [selectedImage,setSelectedImage] = useState();
    const [editor] = useLexicalComposerContext();
    // FileViewer dialog'ını açar
    const handleOpenFileViewer = () => {
        setFileViewerOpen(true);
    };

    // FileViewer dialog'ını kapatır
    const handleCloseFileViewer = () => {
        setFileViewerOpen(false);
    };

    // Dosya seçildiğinde çalışacak fonksiyon
    const handleFileSelect = (selectedFile) => {
        console.log("Seçilen dosya:", selectedFile);
         setSelectedImage(selectedFile); 
        // handleCloseFileViewer(); // Dialog'u kapat
    };

    const insertImage = () => {
        if (selectedImage?.url) {
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: selectedImage?.url,
                altText: selectedImage?.altText || selectedImage?.filename || "selected Image"
            });
        }
        onClose();
    };


    return (
        <div style={{maxWidth:'90%'}}>
            <FileViewer
                open={isFileViewerOpen}
                onClose={handleCloseFileViewer}
                onFileSelect={handleFileSelect}
                funcButton={{
                    text: "Resmi Ekle",
                    onClick: insertImage
                  }}
                // ... Diğer gerekli props
            />
        </div>
    );
}

export default InsertFilePlugin;
