import React, { useState, useCallback, useEffect } from 'react';
import { useMediaQuery, Pagination } from '@mui/material';  // Pagination eklendi
import { Select, MenuItem, FormControl, InputLabel, Grid, ImageList, ImageListItem, ImageListItemBar, LinearProgress, Icon, Paper, IconButton, Drawer, TextField, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadFilesPresigned, renameFile, deleteFile } from '../../api';
import { determineImageSource, generateThumbnails } from '../../utils/file'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
    const [currentPage, setCurrentPage] = useState(1); // Mevcut sayfa
    const [totalPages, setTotalPages] = useState(1); // Toplam sayfa sayısı
    const [itemsPerPage, setItemsPerPage] = useState(24); // Sayfa başına gösterilecek öğe sayısı (örneğin 12)

    // Direkt CSS medya sorgusu ifadesi kullanılıyor
    const isLargeScreen = useMediaQuery('(min-width:600px)'); // 'md' breakpoint
    const cols = isLargeScreen ? 8 : 2;

    const isSelected = useCallback((file) => {
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
        setFileDetails({ fileName: file?.originalName || '', ...file });
        setNewFileName(file?.originalName || ''); // Yeni ad için mevcut dosya adını başlangıç değeri olarak set et
        setNewFilePath(file.bucketPath); // Yeni yol için mevcut dosya yolunu başlangıç değeri olarak set et
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const handleFileSelect = (file) => {
        if (isSelected(file)) {
            setSelectedFiles(selectedFiles.filter(selectedFile => selectedFile._id !== file._id));
        } else {
            setSelectedFiles([...selectedFiles, file]);
        }
        onFileSelect(file);
    };

    const handleRenameClick = () => {
        setIsRenaming(true);
    };

    const handleUpdateClick = async () => {
        if (!fileDetails || !newFileName) return;

        try {
            await renameFile(fileDetails.bucketPath, fileDetails.originalName, newFilePath, newFileName, fileDetails._id);
            setIsRenaming(false);
            onUpload(); // Dosya listesini yenile
            fetchFiles(); // Yeni adlandırmadan sonra dosya listesini yenile
        } catch (error) {
            console.error('Error renaming file:', error);
        }

        setIsRenaming(false);
    };

    const handleClickDelete = async () => {
        try {
            await deleteFile(fileDetails._id);
            handleCloseDrawer();
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    const handleFileUpload = async (event) => {
        const uploadedFiles = event.target.files;
        setIsUploading(true);
        try {
            const filesToUpload = [];
            for (const file of uploadedFiles) {
                filesToUpload.push(file);
                if (file.type.startsWith('image/')) {
                    const thumbs = await generateThumbnails(file);
                    thumbs.forEach(({ size, blob }) => {
                        filesToUpload.push(new File([blob], `${file.name}-${size}.webp`, { type: 'image/webp' }));
                    });
                }
            }
            await uploadFilesPresigned(filesToUpload, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            });
            setIsUploading(false);
            setUploadProgress(0);
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

    const fetchFiles = async (search = '') => {
        let excludeIds = [];
        let combinedFiles = [];

        if (initialFile?._id) {
            excludeIds = [initialFile._id]
            combinedFiles = [initialFile];
        }

        if (initialSelectedFiles && Array.isArray(initialSelectedFiles && initialSelectedFiles.length > 0)) {
            excludeIds = initialSelectedFiles.map(file => file._id);
            combinedFiles = [...initialSelectedFiles];
        } else if (initialSelectedFiles && typeof initialSelectedFiles === 'object' && initialSelectedFiles._id) {
            excludeIds.push(initialSelectedFiles._id);
            combinedFiles = [initialSelectedFiles];
        }

        try {
            const filesData = await getFiles(search, currentPage, itemsPerPage, excludeIds, fileTypeFilter);
            combinedFiles = [...combinedFiles, ...filesData.files];
            setFiles(combinedFiles);
            setTotalPages(Math.ceil(filesData.totalFiles / itemsPerPage));  // Toplam sayfa sayısını ayarlayın
        } catch (error) {
            console.error("Dosyaları çekerken hata oluştu:", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [fileTypeFilter, currentPage]);  // `fileTypeFilter` ve `currentPage` değiştiğinde yenile

    useEffect(() => {
        const debouncedFetch = _.debounce(() => fetchFiles(searchTerm), 400);
        debouncedFetch();

        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);  // Mevcut sayfayı güncelleyin
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
                            style={{ minWidth: 140 }}
                        >
                            <MenuItem value=""><em>Hepsi</em></MenuItem>
                            <MenuItem value="image">Resimler</MenuItem>
                            <MenuItem value="application">Dokümanlar</MenuItem>
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
                    <Pagination
                        count={totalPages}  // Toplam sayfa sayısı
                        page={currentPage}  // Mevcut sayfa
                        onChange={handlePageChange}  // Sayfa değişimi işlevi
                        color="primary"
                        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
                    />
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
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton onClick={handleClickCopy} edge="end">
                                                        <ContentCopyIcon fontSize='small' />
                                                    </IconButton>
                                                ),
                                            }}
                                        />
                                    </div>
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
