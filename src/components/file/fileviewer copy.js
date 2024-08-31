import React, { useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel, Grid, ImageList, ImageListItem, ImageListItemBar, LinearProgress, Icon, Paper, IconButton, Drawer, TextField, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadFiles, renameFile, deleteFile } from '../../api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { determineImageSource } from '../../utils/file'
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { getFiles } from '../../api';
import _ from 'lodash';

function FileViewer({ onFileSelect, onUpload, funcButton, initialSelectedFiles = [], initialFile = {}, multiSelect = false }) {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fileDetails, setFileDetails] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFilePath, setNewFilePath] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState(''); // Dosya türü filtresi
    const [searchTerm, setSearchTerm] = useState(''); // Arama terimi
    const [files, setFiles] = useState([]); // Yüklenen dosyalar


    // Direkt CSS medya sorgusu ifadesi kullanılıyor
    const isLargeScreen = useMediaQuery('(min-width:600px)'); // 'md' breakpoint

    const cols = isLargeScreen ? 8 : 2;

    const isSelected = useCallback((file) => {
        console.log(selectedFiles)
        return selectedFiles.some(selectedFile => selectedFile._id === file._id) ||
            initialSelectedFiles.some(initialFile => initialFile._id === file._id) || initialFile?._id === file._id;

    }, [selectedFiles, initialSelectedFiles, initialFile]);


    const onDrop = useCallback((acceptedFiles) => {
        handleFileUpload({ target: { files: acceptedFiles } });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const fileInputStyle = {
        border: '2px dashed #bbb',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        color: '#bbb',
        ':hover': {
            borderColor: 'black',
            color: 'black'
        }
    };

    const handleInfoClick = (file) => {
        setFileDetails({ fileName: file?.originalName||'', ...file });
        setNewFileName(file?.originalName||''); // Yeni ad için mevcut dosya adını başlangıç değeri olarak set et
        setNewFilePath(file.bucketPath); // Yeni yol için mevcut dosya yolunu başlangıç değeri olarak set et
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };


    const handleFileSelect = (file) => {
        if (isSelected(file)) {
            // Eğer dosya zaten seçiliyse, seçimini kaldır
            setSelectedFiles(selectedFiles.filter(selectedFile => selectedFile._id !== file._id));
        } else {
            // Eğer dosya seçili değilse, seçim listesine ekle
            setSelectedFiles([...selectedFiles, file]);
        }
        onFileSelect(file);
    };

    const handleRenameClick = () => {
        setIsRenaming(true);
    };

    const handleUpdateClick = async () => {
        if (!fileDetails || !newFileName) return; // Eğer detaylar yoksa veya yeni isim boşsa dön

        try {
            await renameFile(fileDetails.bucketPath, fileDetails.originalName, newFilePath, newFileName, fileDetails._id);
            setIsRenaming(false); // Yeniden adlandırma modunu kapat
            onUpload(); // Yeniden adlandırmadan sonra dosya listesini yenile (bu fonksiyon dışardan gelmeli)
            // Başarılı işlem mesajı veya state güncellemesi
        } catch (error) {
            console.error('Error renaming file:', error);
            // Hata mesajı veya işlemi
        }

        setIsRenaming(false);
    };
    const handleClickDelete = async () => {
        // Yeniden adlandırma güncelleme işlevi burada
        // if (!fileDetails || !newFileName) return; // Eğer detaylar yoksa veya yeni isim boşsa dön
        try {
            // API'den gelen yeni dosya adı ile dosyayı yeniden adlandır
            //(oldFilePath ,oldFileName, newFilePath,newFileName, fileId)
            await deleteFile(fileDetails._id);
            // onUpload(); // Yeniden adlandırmadan sonra dosya listesini yenile (bu fonksiyon dışardan gelmeli)
            // Başarılı işlem mesajı veya state güncellemesi
            handleCloseDrawer()
            fetchFiles()
        } catch (error) {
            console.error('Error renaming file:', error);
            // Hata mesajı veya işlemi
        }
    }

    const handleFileUpload = async (event) => {
        // Logic to handle file upload
        const uploadedFiles = event.target.files;
        setIsUploading(true);
        try {
            await uploadFiles(Array.from(uploadedFiles), (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            });
            setIsUploading(false);
            setUploadProgress(0);
            // Callback fonksiyonunu çağırarak FilePages bileşeninde dosya listesini yenileyin
            onUpload();
            fetchFiles();
        } catch (error) {
            console.error('Error uploading files:', error);
            setIsUploading(false);
            fetchFiles();
        }
    };

    const handleClickCopy = () => {
        if (fileDetails && fileDetails.url) {
            navigator.clipboard.writeText(fileDetails.url); // URL'yi panoya kopyalar
        }
    };

    const renderFileItem = (file, index) => {
        // Logic to determine the image source based on file type
        let imgSrc = determineImageSource(file);

        const isSelectedFile = isSelected(file);

        return (
            <ImageListItem key={file._id + index} sx={{ position: 'relative' }}>
                {isSelectedFile && (
                    <IconButton sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Açık renkli arka plan
                        padding: '2px', // Arka plan ve icon arasında biraz boşluk
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Hover durumunda arka plan rengi
                        },
                        zIndex: 2
                    }}
                    >
                        <CheckCircleOutlineIcon sx={{ color: 'green' }} />
                    </IconButton>
                )}
                <img src={imgSrc} alt={file.originalName} onClick={() => handleFileSelect(file)} style={isSelectedFile ? { filter: 'brightness(60%)' } : {}} />
                {isSelectedFile && (
                    <div onClick={() => handleFileSelect(file)} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 123, 255, 0.3)'
                    }}></div>
                )}
                <ImageListItemBar
                    title={file.originalName || ''}
                    actionIcon={

                        <IconButton
                            onClick={() => handleInfoClick(file)}
                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                            aria-label={`info about ${file.fileName}`}
                        >
                            <InfoIcon />
                        </IconButton>
                    }
                />
            </ImageListItem>
        );
    };

    // const fetchFiles = async (search = '') => {
    //     // Başlangıçta seçili dosyaların ID'lerini çıkar

    //     const excludeIds = initialSelectedFiles?.map(file => file._id) ;

    //     try {
    //         // API isteğini yapın, `search` ve `excludeIds`'ı parametre olarak geçirin
    //         const filesData = await getFiles(search, excludeIds);
    //         // `initialSelectedFiles` listesi ile API'den gelen dosya listesini birleştir
    //         // Burada, API'nin zaten `excludeIds`'ı dikkate alarak sonuçları filtrelediğini varsayıyoruz
    //         const combinedFiles = [...initialSelectedFiles, ...filesData.files];
    //         setFiles(combinedFiles);
    //     } catch (error) {
    //         console.error("Dosyaları çekerken hata oluştu:", error);
    //     }
    // };

    const fetchFiles = async (search = '') => {
        let excludeIds = [];
        let combinedFiles = [];

        if (initialFile?._id) {
            excludeIds = [initialFile._id]
            combinedFiles = [initialFile];
        }

        // `initialSelectedFiles` kontrolü
        if (initialSelectedFiles && Array.isArray(initialSelectedFiles && initialSelectedFiles.length > 0)) {
            // Eğer dizi ise, ID'leri çıkar
            excludeIds = initialSelectedFiles.map(file => file._id);
            combinedFiles = [...initialSelectedFiles];
        } else if (initialSelectedFiles && typeof initialSelectedFiles === 'object' && initialSelectedFiles._id) {
            // Eğer obje ise ve `_id` özelliği var ise, bu ID'yi kullan
            excludeIds.push(initialSelectedFiles._id);
            combinedFiles = [initialSelectedFiles];
        }

        try {
            // API isteğini yapın, `search` ve `excludeIds`'ı parametre olarak geçirin
            const filesData = await getFiles(search, 1, 10, excludeIds,fileTypeFilter);
            // API'den gelen dosyaları mevcut dosyalarla birleştir
            combinedFiles = [...combinedFiles, ...filesData.files];
            setFiles(combinedFiles);
        } catch (error) {
            console.error("Dosyaları çekerken hata oluştu:", error);
        }
    };


    //   // Dosya listesini API'den çekmek için kullanılan useEffect
      useEffect(() => {
        fetchFiles();
    }, [fileTypeFilter]);

    useEffect(() => {
        // console.log("debouncedFetch :",searchTerm,initialSelectedFiles ) 
        const debouncedFetch = _.debounce(() => fetchFiles(searchTerm), 400);
        debouncedFetch();

        // Cleanup fonksiyonu, useEffect temizlendiğinde debounce'ı iptal eder
        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm]);

    // useEffect(() => {
    //     // Başlangıçta seçili dosyaları `files` listesine ekleyin
    //     setFiles(initialSelectedFiles);
    //     // API'den dosyaları çekin, başlangıçta seçili dosyaları hariç tutarak
    //     // fetchFiles();
    //   }, [initialSelectedFiles]);

    return (
        <Grid container style={{ height: '100%', paddingTop: 10 }} spacing={2}>
            <Grid container spacing={2} style={{ margin: 10 }}>
                <Grid item xs={12} sm={4}>
                    {funcButton && (
                        <Button onClick={funcButton.onClick}>
                            {funcButton.text}
                        </Button>
                    )}
                </Grid>
                <Grid item xs={12} sm={4} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <TextField
                        label="Ara"
                        variant="outlined"
                        size='small'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    // style={{ width: '100%' }} // TextField'ı genişlet
                    />
                </Grid>
                <Grid item xs={12} sm={4} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <FormControl variant="outlined" fullWidth style={{ minWidth: 140 }} size='small'>
                        <InputLabel>Filtrele</InputLabel>
                        <Select
                            value={fileTypeFilter}
                            onChange={(e) => setFileTypeFilter(e.target.value)}
                            size='small'
                            label="Filtrele"
                            style={{ minWidth: 140 }} // Select'ı genişlet
                        >
                            <MenuItem value=""><em>Hepsi</em></MenuItem>
                            <MenuItem value="image">Resimler</MenuItem>
                            <MenuItem value="application">Dokümanlar</MenuItem>
                            {/* Diğer dosya türleri */}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid item xs={12} style={{ overflowY: 'auto' }}>
                <div style={{ width: '100%', margin: '0 auto' }}>
                    <Paper {...getRootProps()} style={isDragActive ? { ...fileInputStyle, borderColor: 'black', color: 'black' } : fileInputStyle}>
                        <input {...getInputProps()} />
                        <p>Dosyalarınızı buraya sürükleyin veya seçmek için tıklayın</p>
                    </Paper>
                    {isUploading && <LinearProgress variant="determinate" value={uploadProgress} />}
                    <ImageList cols={cols}>
                        {files.map((file, index) => renderFileItem(file, index))}
                    </ImageList>
                    <Drawer
                        anchor="right"
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                    >
                        <div style={{ width: 250, padding: 10 }}>
                            {fileDetails && (
                                <>
                                    <h3>Dosya Bilgileri</h3>
                                    <p>{fileDetails.originalName}</p>
                                    <div style={{ marginBottom: '10px' }}>
                                        <TextField
                                            label="Dosya URL'si"
                                            defaultValue={fileDetails.bucketPath}
                                            size='small'
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            InputProps={{ // TextField içinde buton eklemek için InputProps kullanılıyor
                                                endAdornment: (
                                                    <IconButton onClick={handleClickCopy} edge="end">
                                                        <ContentCopyIcon fontSize='small' /> {/* Kopyala ikonu */}
                                                    </IconButton>
                                                ),
                                            }}
                                        />
                                    </div>
                                    {/* {isRenaming ? (
                                        <>
                                            <TextField
                                                label="Yeni Ad"
                                                defaultValue={fileDetails.originalName}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                onChange={(e) => setNewFileName(e.target.value)}
                                            />
                                            <TextField
                                                label="Dosya Yolu"
                                                defaultValue={fileDetails.bucketPath}
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                onChange={(e) => setNewFilePath(e.target.value)}
                                            />
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleUpdateClick}
                                                fullWidth
                                            >
                                                Güncelle
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleRenameClick}
                                            fullWidth
                                        >
                                            Yeniden Adlandır
                                        </Button>
                                    )} */}

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        color="secondary"
                                        onClick={handleClickDelete}
                                        style={{ marginTop: 20 }}
                                    >
                                        Sil
                                    </Button>
                                </>
                            )}
                        </div>
                    </Drawer>
                </div>
            </Grid>
        </Grid>
    );

}

export default FileViewer;
