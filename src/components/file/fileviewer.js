import React, { useState, useCallback, useEffect } from 'react';
import {
  useMediaQuery,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Paper,
  IconButton,
  Drawer,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadFilesPresigned, updateFile, deleteFile, getFiles } from '../../api';
import { determineImageSource, generateThumbnails, buildFileMeta, isImageFile } from '../../utils/file';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { notifyError, notifySuccess } from '../../services/notificationBus';
import _ from 'lodash';

function FileViewer({ onFileSelect, onUpload, funcButton, initialSelectedFiles = [], initialFile = {}, multiSelect = false }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [drawerMeta, setDrawerMeta] = useState(null);
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(24);

  const isLargeScreen = useMediaQuery('(min-width:600px)');
  const cols = isLargeScreen ? 8 : 2;

  const isSelected = useCallback(
    (file) =>
      selectedFiles.some((selectedFile) => selectedFile._id === file._id) ||
      (Array.isArray(initialSelectedFiles) && initialSelectedFiles.some((selectedFile) => selectedFile._id === file._id)) ||
      initialFile?._id === file._id,
    [selectedFiles, initialSelectedFiles, initialFile]
  );

  const fetchFiles = useCallback(
    async (search = '') => {
      const excludeIds = [];
      let combinedFiles = [];

      if (initialFile?._id) {
        excludeIds.push(initialFile._id);
        combinedFiles = [initialFile];
      }

      if (Array.isArray(initialSelectedFiles) && initialSelectedFiles.length > 0) {
        excludeIds.push(...initialSelectedFiles.map((file) => file._id));
        combinedFiles = [...combinedFiles, ...initialSelectedFiles];
      } else if (initialSelectedFiles && typeof initialSelectedFiles === 'object' && initialSelectedFiles._id) {
        excludeIds.push(initialSelectedFiles._id);
        combinedFiles = [...combinedFiles, initialSelectedFiles];
      }

      try {
        const filesData = await getFiles(search, currentPage, itemsPerPage, excludeIds, fileTypeFilter);
        combinedFiles = [...combinedFiles, ...(filesData?.files || [])];
        setFiles(combinedFiles);
        setTotalPages(Math.max(1, Math.ceil((filesData?.totalFiles || 0) / itemsPerPage)));
      } catch (error) {
        console.error('Dosyaları çekerken hata oluştu:', error);
      }
    },
    [initialFile, initialSelectedFiles, currentPage, itemsPerPage, fileTypeFilter]
  );

  const onDrop = (acceptedFiles) => {
    handleFileUpload({ target: { files: acceptedFiles } });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fileInputStyle = {
    border: '2px dashed #bbb',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    color: '#777',
    transition: 'all .2s ease'
  };

  const handleInfoClick = (file) => {
    setFileDetails({ fileName: file?.originalName || '', ...file });
    setNewFileName(file?.originalName || '');
    setNewAltText(file?.altText || '');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setFileDetails(null);
    setDrawerMeta(null);
    setIsMetaLoading(false);
  };

  const handleFileSelect = (file) => {
    if (multiSelect) {
      if (isSelected(file)) {
        setSelectedFiles((prev) => prev.filter((selectedFile) => selectedFile._id !== file._id));
      } else {
        setSelectedFiles((prev) => [...prev, file]);
      }
    } else {
      setSelectedFiles((prev) => (prev.some((selectedFile) => selectedFile._id === file._id) ? [] : [file]));
    }
    onFileSelect?.(file);
  };

  const handleUpdateClick = async () => {
    if (!fileDetails) return;

    const trimmedName = newFileName.trim();
    if (!trimmedName) {
      notifyError('Dosya adı boş bırakılamaz.');
      return;
    }

    setIsSavingDetails(true);
    try {
      const payload = {
        filename: trimmedName,
        altText: newAltText.trim()
      };

      const updatedFile = await updateFile(fileDetails._id, payload);
      setFileDetails(updatedFile);
      setNewFileName(updatedFile?.originalName || trimmedName);
      setNewAltText(updatedFile?.altText || newAltText.trim());
      notifySuccess('Dosya bilgileri güncellendi.');
      onUpload?.();
      fetchFiles(searchTerm);
    } catch (error) {
      const message = error?.response?.data?.message || 'Dosya bilgileri güncellenemedi.';
      notifyError(message);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleClickDelete = async () => {
    if (!fileDetails?._id) return;
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;

    try {
      await deleteFile(fileDetails._id);
      notifySuccess('Dosya silindi.');
      handleCloseDrawer();
      onUpload?.();
      fetchFiles(searchTerm);
    } catch (error) {
      const message = error?.response?.data?.message || 'Dosya silinemedi.';
      notifyError(message);
    }
  };

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

      setUploadProgress(0);
      onUpload?.();
      fetchFiles(searchTerm);
    } catch (error) {
      console.error('Error uploading files:', error);
      notifyError('Dosya yükleme sırasında hata oluştu.');
      fetchFiles(searchTerm);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickCopy = () => {
    if (fileDetails?.url) {
      navigator.clipboard.writeText(fileDetails.url);
      notifySuccess('Dosya URL panoya kopyalandı.');
    }
  };

  useEffect(() => {
    if (searchTerm) return;
    fetchFiles('');
  }, [fetchFiles, searchTerm]);

  useEffect(() => {
    if (!searchTerm) return undefined;
    const debouncedFetch = _.debounce(() => fetchFiles(searchTerm), 400);
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [searchTerm, fetchFiles]);

  useEffect(() => {
    let mounted = true;
    const enrichFileMeta = async () => {
      if (!fileDetails) return;
      setIsMetaLoading(true);
      try {
        const metadata = await buildFileMeta(fileDetails);
        if (mounted) {
          setDrawerMeta(metadata);
        }
      } finally {
        if (mounted) {
          setIsMetaLoading(false);
        }
      }
    };

    enrichFileMeta();
    return () => {
      mounted = false;
    };
  }, [fileDetails]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const renderFileItem = (file, index) => {
    const imgSrc = determineImageSource(file);
    const isSelectedFile = isSelected(file);

    return (
      <ImageListItem key={file._id + index} sx={{ position: 'relative' }}>
        {isSelectedFile && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '2px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              },
              zIndex: 2
            }}
          >
            <CheckCircleOutlineIcon sx={{ color: 'green' }} />
          </IconButton>
        )}
        <img
          src={imgSrc}
          alt={file.originalName}
          onClick={() => handleFileSelect(file)}
          style={isSelectedFile ? { filter: 'brightness(60%)', cursor: 'pointer' } : { cursor: 'pointer' }}
        />
        {isSelectedFile && (
          <div
            onClick={() => handleFileSelect(file)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 123, 255, 0.28)'
            }}
          />
        )}
        <ImageListItemBar
          title={file.originalName || ''}
          actionIcon={
            <IconButton
              onClick={() => handleInfoClick(file)}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              aria-label={`info about ${file.fileName || file.originalName}`}
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
          {funcButton && <Button onClick={funcButton.onClick}>{funcButton.text}</Button>}
        </Grid>
        <Grid item xs={12} sm={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <TextField label="Ara" variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FormControl variant="outlined" fullWidth style={{ minWidth: 140 }} size="small">
            <InputLabel>Filtrele</InputLabel>
            <Select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)} size="small" label="Filtrele" style={{ minWidth: 140 }}>
              <MenuItem value="">
                <em>Hepsi</em>
              </MenuItem>
              <MenuItem value="image">Resimler</MenuItem>
              <MenuItem value="application">Dokümanlar</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid item xs={12} style={{ overflowY: 'auto' }}>
        <div style={{ width: '100%', margin: '0 auto' }}>
          <Paper {...getRootProps()} style={isDragActive ? { ...fileInputStyle, borderColor: '#111', color: '#111' } : fileInputStyle}>
            <input {...getInputProps()} />
            <p>Dosyalarınızı buraya sürükleyin veya seçmek için tıklayın</p>
          </Paper>
          {isUploading && <LinearProgress variant="determinate" value={uploadProgress} />}

          <ImageList cols={cols}>{files.map((file, index) => renderFileItem(file, index))}</ImageList>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
          />

          <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
            <Box sx={{ width: { xs: 320, sm: 380 }, p: 2 }}>
              {fileDetails && (
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Dosya Bilgileri</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {isMetaLoading && <CircularProgress size={16} />}
                      <IconButton size="small" onClick={handleCloseDrawer} aria-label="Çekmeceyi kapat">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {fileDetails.originalName}
                  </Typography>

                  {isImageFile(fileDetails) && (
                    <Box
                      component="img"
                      src={determineImageSource(fileDetails)}
                      alt={fileDetails.altText || fileDetails.originalName}
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                      }}
                    />
                  )}

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip size="small" label={fileDetails.fileType || 'Bilinmeyen tür'} />
                    <Chip size="small" variant="outlined" label={`Size: ${drawerMeta?.sizeKb || '-'}`} />
                    <Chip size="small" variant="outlined" label={`Dimension: ${drawerMeta?.dimensionText || '-'}`} />
                    <Chip size="small" variant="outlined" label={`Ratio: ${drawerMeta?.ratioText || '-'}`} />
                  </Stack>

                  <Divider />

                  <TextField
                    label="Dosya URL'si"
                    value={fileDetails.url || ''}
                    size="small"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleClickCopy} edge="end">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      )
                    }}
                  />

                  <TextField label="Dosya Adı" size="small" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} fullWidth />
                  <TextField label="Alt Metin" size="small" value={newAltText} onChange={(e) => setNewAltText(e.target.value)} fullWidth />
                  <TextField
                    label="Yol"
                    size="small"
                    value={fileDetails.bucketPath || ''}
                    InputProps={{ readOnly: true }}
                    helperText="Bu alan yalnızca görüntülenir."
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleUpdateClick} disabled={isSavingDetails} fullWidth>
                      {isSavingDetails ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                    <Button variant="contained" color="error" onClick={handleClickDelete} fullWidth>
                      Sil
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Drawer>
        </div>
      </Grid>
    </Grid>
  );
}

export default FileViewer;
