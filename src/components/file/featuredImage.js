import React, { useState,useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import FileViewer from './fileviewer'; // Yolunuzun doğru olduğundan emin olun
import CustomImageButton from '../button/imageButton';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function FeaturedImageUpload({ handleFeaturedImage,initialFile  }) {
    const [open, setOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState({
        mediaId: '',
        url: '',
        mediaType: 'image', // Varsayılan olarak 'image'
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFileSelect = (file) => {
        // Medya türünü belirleyin ve seçilen medyayı state'e kaydedin
        const mediaType = file.mediaType || 'image'; // Varsayılan olarak 'image'
        setSelectedMedia({
            mediaId: file._id || null,
            url: file.url,
            mediaType,
        });
        handleFeaturedImage({ mediaId: file._id || null, url: file.url, mediaType });
        handleClose();
    };
    useEffect(() => {
        // Eğer initialFile var ise, bunu selectedMedia state'ine set et
        if (initialFile) {
            setSelectedMedia({
                mediaId: initialFile.mediaId || null,
                url: initialFile.url,
                mediaType: initialFile.mediaType || 'image', // Varsayılan olarak 'image'
            });
        }
    }, [initialFile]);

    const getImageOrVideoThumbnail = () => {
        if (selectedMedia.mediaType === 'image') {
            return selectedMedia.url || require('../../images/files/add-image.png');
        } else if (selectedMedia.mediaType === 'video') {
            return require('../../images/files/video-thumbnail.png'); // Video için varsayılan bir thumbnail
        }
        return require('../../images/files/add-image.png'); // Varsayılan olarak gösterilecek görsel
    };

    return (
        <div>
            <CustomImageButton
                image={getImageOrVideoThumbnail()} // Medya türüne göre thumbnail gösterimi
                title={selectedMedia.mediaType === 'image' ? "Öne Çıkarılan Görsel Seç" : "Öne Çıkarılan Video Seç"} // Buton üzerinde görünecek metin
                onClick={handleClickOpen} // Dosya yöneticisini açacak fonksiyon
            />
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
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
                    onFileSelect={handleFileSelect} // Seçilen dosyayı işlemek için fonksiyon
                    initialFile={selectedMedia} // Önceden seçili dosyayı gösterir
                    funcButton={{
                        text: selectedMedia.mediaType === 'image' ? "Seçilen Resmi Ekle" : "Seçilen Videoyu Ekle",
                        onClick: () => {
                            console.log("Medya eklendi", selectedMedia);
                        }
                    }}
                />
            </Dialog>
        </div>
    );
}

export default FeaturedImageUpload;
