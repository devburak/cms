import React, { useState, useEffect } from 'react';
import FileViewer from '../components/file/fileviewer';
import { Container } from '@mui/material';




const FilesPage = () => {
    // const [files, setFiles] = useState([]); // Yüklenen dosyalar
    // const [searchTerm, setSearchTerm] = useState(''); // Arama terimi
    // const [fileTypeFilter, setFileTypeFilter] = useState(''); // Dosya türü filtresi
  

    // const fetchFiles = async (search = '') => {
    //     try {
    //         const filesData = await getFiles(search);
    //         console.log(filesData)
    //         setFiles(filesData.files);
    //     } catch (error) {
    //         console.error("Dosyaları çekerken hata oluştu:", error);
    //     }
    // };
    //   // Dosya listesini API'den çekmek için kullanılan useEffect
    //   useEffect(() => {
    //     fetchFiles();
    // }, []);

    // const handleFileUpload = () => {
    //     fetchFiles();
    // };

    const handleFileSelect = (selectedFile) => {
        console.log("Seçilen dosya: ", selectedFile);
    };

  

    // Arama ve filtreleme işlevleri burada implemente edilebilir

    return (
        <Container maxWidth="lg">
            <div style={{ padding: 10 }}>
                <FileViewer
                    onFileSelect={handleFileSelect}
                />
            </div>
        </Container>
    );
};

export default FilesPage;
