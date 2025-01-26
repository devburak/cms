import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import FileViewer from './fileviewer';
import CustomImageButton from '../button/imageButton';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function FeaturedImageUpload({ handleFeaturedImage, initialFile, sx }) {
    const [open, setOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState({
        mediaId: '',
        url: '',
        mediaType: 'image',
    });

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleFileSelect = (file) => {
        const mediaType = file.mediaType || 'image';
        setSelectedMedia({
            mediaId: file._id || null,
            url: file.url,
            mediaType,
        });
        handleFeaturedImage({ mediaId: file._id || null, url: file.url, mediaType });
        handleClose();
    };

    useEffect(() => {
        if (initialFile) {
            setSelectedMedia({
                mediaId: initialFile.mediaId || null,
                url: initialFile.url,
                mediaType: initialFile.mediaType || 'image',
            });
        }
    }, [initialFile]);

    const getImageOrVideoThumbnail = () => {
        if (selectedMedia.mediaType === 'image') {
            return selectedMedia.url || require('../../images/files/add-image.png');
        } else if (selectedMedia.mediaType === 'video') {
            return require('../../images/files/video-thumbnail.png');
        }
        return require('../../images/files/add-image.png');
    };

    return (
        <div>
            <CustomImageButton
                image={getImageOrVideoThumbnail()}
                title={
                    selectedMedia.mediaType === 'image'
                        ? 'Görsel Seç'
                        : 'Video Seç'
                }
                onClick={handleClickOpen}
                sx={sx} // sx propunu CustomImageButton'a geçir
            />
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Dosya Yöneticisi
                        </Typography>
                    </Toolbar>
                </AppBar>
                <FileViewer
                    onFileSelect={handleFileSelect}
                    initialFile={selectedMedia}
                    funcButton={{
                        text:
                            selectedMedia.mediaType === 'image'
                                ? 'Seçilen Resmi Ekle'
                                : 'Seçilen Videoyu Ekle',
                        onClick: () => console.log('Medya eklendi', selectedMedia),
                    }}
                />
            </Dialog>
        </div>
    );
}

export default FeaturedImageUpload;
