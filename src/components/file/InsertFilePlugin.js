// InsertFilePlugin.jsx
import React, { useState ,useEffect} from 'react';
import Button from '@mui/material/Button';
import FileViewer from './fileviewer'; // Doğru yolu kullanın
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {INSERT_IMAGE_COMMAND} from '../lexical/plugins/ImagesPlugin';
import { registerCarouselCommand ,INSERT_CAROUSEL_COMMAND} from './CarouselNode'; 
import { INSERT_DOCUMENT_COMMAND,registerDocumentCommand } from "../lexical/plugins/DocumentsPlugin";// Belge ekleme komutunu tanımlayın


function InsertFilePlugin( {onClose}) {
    const [isFileViewerOpen, setFileViewerOpen] = useState(true);
    // const [selectedImage,setSelectedImage] = useState();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editor] = useLexicalComposerContext();
    // FileViewer dialog'ını açar
    const handleOpenFileViewer = () => {
        setFileViewerOpen(true);
    };

    // FileViewer dialog'ını kapatır
    const handleCloseFileViewer = () => {
        setFileViewerOpen(false);
    };

    const isSelected = (file) => {
        return selectedFiles.some(selectedFile => selectedFile._id === file._id);
    };

    // Dosya seçildiğinde çalışacak fonksiyon
    // const handleFileSelect = (selectedFile) => {
    //     console.log("Seçilen dosya:", selectedFile);
    //      setSelectedImage(selectedFile); 
    //     // handleCloseFileViewer(); // Dialog'u kapat
    // };
     // Dosya seçildiğinde çalışacak fonksiyon
     const handleFileSelect = (file) => {
        if (isSelected(file)) {
            // Eğer seçilmişse listeden çıkar
            setSelectedFiles((prev) => prev.filter(selectedFile => selectedFile._id !== file._id));
        } else {
            // Değilse listeye ekle
            setSelectedFiles((prev) => [...prev, file]);
        }
    };

    // const insertContent = () => {
    //     if (selectedFiles.length === 1) {
    //         // Tek bir dosya seçilmişse resim olarak ekle
    //         const file = selectedFiles[0];
    //         editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    //             resizable: true,
    //             maxWidth: 600,
    //             width: 'inherit',
    //             height: 'auto',
    //             src: file.url,
    //             altText: file.altText || file.filename || "selected Image",
    //         });
    //     } else if (selectedFiles.length > 1) {
    //         // Çoklu dosya seçilmişse slider ekle
    //         const imageUrls = selectedFiles.map((file) => file.url);
    //         editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, { images: imageUrls });
    //     }
    //     onClose();
    // };

  
    const insertContent = () => {
        if (selectedFiles.length === 1) {
            // Tek bir dosya seçilmişse
            const file = selectedFiles[0];
            const fileType =  file.filename.split('.').pop().toLowerCase();
    
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType)) {
                // Resim dosyası ise
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    resizable: true,
                    maxWidth: 600,
                    width: 'inherit',
                    height: 'auto',
                    src: file.url,
                    altText: file.altText || file.filename || "selected Image",
                });
            } else {
                console.log("Döküman dosyası:", file);
                // Döküman dosyası ise
                
                editor.dispatchCommand(INSERT_DOCUMENT_COMMAND, {
                    link: file.url,
                    filename: file?.originalName || "Untitled Document",
                });
            }
        } else if (selectedFiles.length > 1) {
            // Çoklu dosya seçilmişse
            const imageFiles = [];
            const documentFiles = [];
    
            // Dosyaları türüne göre ayır
            selectedFiles.forEach((file) => {
                const fileType =  file.filename.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType)) {
                    imageFiles.push(file);
                } else {
                    documentFiles.push(file);
                }
            });
            console.log("documentFiles",documentFiles);
            // Dökümanları ekle
            documentFiles.forEach((file) => {
       
                editor.dispatchCommand(INSERT_DOCUMENT_COMMAND, {
                    link: file.url,
                    filename: file?.originalName || "Untitled Document",
                });
            });
    
            // Kalan resimleri slider olarak ekle
            if (imageFiles.length > 0) {
                const imageUrls = imageFiles.map((file) => file.url);
                editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, { images: imageUrls });
            }
        }
    
        onClose();
    };
    
    useEffect(() => {
        // registerDocumentCommand(editor);
        return registerCarouselCommand(editor);
    }, [editor]);

    // const insertImage = () => {
    //     if (selectedImage?.url) {
    //         editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    //             resizable:true,
    //             maxWidth: 600, // Varsayılan genişlik değeri
    //             width: '100%', // Genişliği %100 yaparak stil problemlerini engelle
    //             height: 'auto', // Yüksekliği otomatik ayarla
    //             src: selectedImage?.url,
    //             altText: selectedImage?.altText || selectedImage?.filename || "selected Image"
    //         });
    //     }
    //     onClose();
    // };


    return (
        <div style={{maxWidth:'90%'}}>
            <FileViewer
                open={isFileViewerOpen}
                onClose={handleCloseFileViewer}
                onFileSelect={handleFileSelect}
                multiSelect={true} // Çoklu seçim için
                funcButton={{
                    text: "Dosya(lar) Ekle",
                     onClick: insertContent
                    // onclick: insertImage
                  }}
                // ... Diğer gerekli props
            />
        </div>
    );
}

export default InsertFilePlugin;
