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
  CircularProgress,
  Skeleton,
  Alert
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

const EMPTY_INITIAL_SELECTED_FILES = Object.freeze([]);
const EMPTY_INITIAL_FILE = Object.freeze({});

const FILE_VIEWER_TOKENS = {
  surface: 'rgba(248, 250, 252, 0.96)',
  surfaceAlt: 'rgba(237, 242, 247, 0.92)',
  elevated: '#ffffff',
  border: 'rgba(15, 23, 42, 0.1)',
  ink: '#172033',
  inkMuted: '#5c667a',
  accent: '#0f6cbd',
  shadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
};

function FileTileSkeleton() {
  return (
    <ImageListItem
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: FILE_VIEWER_TOKENS.border,
        bgcolor: FILE_VIEWER_TOKENS.elevated,
        boxShadow: FILE_VIEWER_TOKENS.shadow
      }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          transform: 'none',
          bgcolor: FILE_VIEWER_TOKENS.surfaceAlt
        }}
      />
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Skeleton variant="text" width="78%" height={24} sx={{ bgcolor: FILE_VIEWER_TOKENS.surfaceAlt }} />
        <Skeleton variant="text" width="44%" height={18} sx={{ bgcolor: FILE_VIEWER_TOKENS.surfaceAlt }} />
      </Box>
    </ImageListItem>
  );
}

function FilePreviewImage({ src, alt, onClick, isSelectedFile, lazy = true, objectFit = 'cover', maxHeight }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: maxHeight ? undefined : '1 / 1',
        minHeight: maxHeight || undefined,
        bgcolor: FILE_VIEWER_TOKENS.surface,
        overflow: 'hidden'
      }}
    >
      {!isLoaded && !hasError && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            transform: 'none',
            bgcolor: FILE_VIEWER_TOKENS.surfaceAlt
          }}
        />
      )}

      <Box
        component="img"
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        onClick={onClick}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: maxHeight || undefined,
          objectFit,
          cursor: onClick ? 'pointer' : 'default',
          opacity: isLoaded ? 1 : 0,
          filter: isSelectedFile ? 'brightness(60%)' : 'none',
          transition: 'opacity 180ms ease, filter 180ms ease'
        }}
      />

      {hasError && (
        <Stack
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            inset: 0,
            px: 2,
            textAlign: 'center',
            color: FILE_VIEWER_TOKENS.inkMuted
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Onizleme hazir degil
          </Typography>
          <Typography variant="caption">Dosya bilgilerini sag panelden acabilirsiniz.</Typography>
        </Stack>
      )}
    </Box>
  );
}

function FileViewer({
  onFileSelect,
  onUpload,
  funcButton,
  initialSelectedFiles = EMPTY_INITIAL_SELECTED_FILES,
  initialFile = EMPTY_INITIAL_FILE,
  multiSelect = false,
  showInfoButton = true
}) {
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
  const [isFilesLoading, setIsFilesLoading] = useState(true);
  const [fileFetchError, setFileFetchError] = useState('');

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
        setIsFilesLoading(true);
        setFileFetchError('');
        const filesData = await getFiles(search, currentPage, itemsPerPage, excludeIds, fileTypeFilter);
        combinedFiles = [...combinedFiles, ...(filesData?.files || [])];
        setFiles(combinedFiles);
        setTotalPages(Math.max(1, Math.ceil((filesData?.totalFiles || 0) / itemsPerPage)));
      } catch (error) {
        console.error('Dosyaları çekerken hata oluştu:', error);
        setFileFetchError('Dosyalar yuklenemedi. Baglantiyi kontrol edip tekrar deneyin.');
      } finally {
        setIsFilesLoading(false);
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
      <ImageListItem
        key={file._id + index}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid',
          borderColor: FILE_VIEWER_TOKENS.border,
          bgcolor: FILE_VIEWER_TOKENS.elevated,
          boxShadow: FILE_VIEWER_TOKENS.shadow
        }}
      >
        {isSelectedFile && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.84)',
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

        <FilePreviewImage
          src={imgSrc}
          alt={file.altText || file.originalName}
          onClick={() => handleFileSelect(file)}
          isSelectedFile={isSelectedFile}
          lazy={isImageFile(file)}
        />

        {isSelectedFile && (
          <Box
            onClick={() => handleFileSelect(file)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 108, 189, 0.24)'
            }}
          />
        )}
        <ImageListItemBar
          title={file.originalName || ''}
          subtitle={isImageFile(file) ? 'Gorsel' : 'Dosya'}
          sx={{
            '& .MuiImageListItemBar-title': {
              fontWeight: 600
            },
            '& .MuiImageListItemBar-subtitle': {
              color: 'rgba(255, 255, 255, 0.78)'
            }
          }}
          actionIcon={
            showInfoButton ? (
              <IconButton
                onClick={() => handleInfoClick(file)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                aria-label={`info about ${file.fileName || file.originalName}`}
              >
                <InfoIcon />
              </IconButton>
            ) : null
          }
        />
      </ImageListItem>
    );
  };

  const loadingSkeletons = Array.from({ length: isLargeScreen ? 16 : 6 }, (_, index) => index);
  const showInitialSkeletons = isFilesLoading && files.length === 0;

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: '100%',
        pt: 1.25,
        color: FILE_VIEWER_TOKENS.ink,
        '--files-surface': FILE_VIEWER_TOKENS.surface,
        '--files-surface-alt': FILE_VIEWER_TOKENS.surfaceAlt,
        '--files-elevated': FILE_VIEWER_TOKENS.elevated,
        '--files-border': FILE_VIEWER_TOKENS.border,
        '--files-ink': FILE_VIEWER_TOKENS.ink,
        '--files-ink-muted': FILE_VIEWER_TOKENS.inkMuted,
        '--files-accent': FILE_VIEWER_TOKENS.accent
      }}
    >
      <Grid container spacing={2} sx={{ m: 1.25 }}>
        <Grid item xs={12} sm={4}>
          {funcButton && <Button onClick={funcButton.onClick}>{funcButton.text}</Button>}
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <TextField label="Ara" variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FormControl variant="outlined" fullWidth sx={{ minWidth: 140 }} size="small">
            <InputLabel>Filtrele</InputLabel>
            <Select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)} size="small" label="Filtrele" sx={{ minWidth: 140 }}>
              <MenuItem value="">
                <em>Hepsi</em>
              </MenuItem>
              <MenuItem value="image">Resimler</MenuItem>
              <MenuItem value="application">Dokümanlar</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ overflowY: 'auto' }}>
        <Box sx={{ width: '100%', mx: 'auto' }}>
          <Paper
            {...getRootProps()}
            sx={
              isDragActive
                ? {
                    ...fileInputStyle,
                    borderColor: FILE_VIEWER_TOKENS.accent,
                    color: FILE_VIEWER_TOKENS.ink,
                    background:
                      'linear-gradient(135deg, rgba(15, 108, 189, 0.08) 0%, rgba(255, 255, 255, 0.96) 100%)',
                    boxShadow: FILE_VIEWER_TOKENS.shadow
                  }
                : {
                    ...fileInputStyle,
                    color: FILE_VIEWER_TOKENS.inkMuted,
                    borderColor: FILE_VIEWER_TOKENS.border,
                    background:
                      'linear-gradient(135deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%)'
                  }
            }
          >
            <input {...getInputProps()} />
            <p>Dosyalarınızı buraya sürükleyin veya seçmek için tıklayın</p>
          </Paper>
          {isUploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1.5 }} />}

          {fileFetchError && (
            <Alert
              severity="error"
              sx={{ mt: 2, borderRadius: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => fetchFiles(searchTerm)}>
                  Tekrar dene
                </Button>
              }
            >
              {fileFetchError}
            </Alert>
          )}

          <Box sx={{ position: 'relative', mt: 2 }} aria-busy={isFilesLoading}>
            {showInitialSkeletons ? (
              <ImageList cols={cols} gap={16}>
                {loadingSkeletons.map((item) => (
                  <FileTileSkeleton key={`file-skeleton-${item}`} />
                ))}
              </ImageList>
            ) : (
              <>
                <ImageList cols={cols} gap={16}>
                  {files.map((file, index) => renderFileItem(file, index))}
                </ImageList>

                {!isFilesLoading && files.length === 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1,
                      p: 4,
                      borderRadius: 3,
                      textAlign: 'center',
                      bgcolor: FILE_VIEWER_TOKENS.surface,
                      borderColor: FILE_VIEWER_TOKENS.border
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: FILE_VIEWER_TOKENS.ink }}>
                      Dosya bulunamadi
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: FILE_VIEWER_TOKENS.inkMuted }}>
                      Aramayi daraltin ya da yeni bir dosya yukleyin.
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            {isFilesLoading && files.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  backdropFilter: 'blur(6px)',
                  background: 'rgba(255, 255, 255, 0.42)',
                  pointerEvents: 'none'
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CircularProgress size={24} sx={{ color: FILE_VIEWER_TOKENS.accent }} />
                  <Typography variant="body2" sx={{ color: FILE_VIEWER_TOKENS.ink, fontWeight: 600 }}>
                    Dosyalar yenileniyor
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
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
                    <FilePreviewImage
                      src={determineImageSource(fileDetails)}
                      alt={fileDetails.altText || fileDetails.originalName}
                      lazy={false}
                      objectFit="contain"
                      maxHeight={200}
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
        </Box>
      </Grid>
    </Grid>
  );
}

export default FileViewer;
