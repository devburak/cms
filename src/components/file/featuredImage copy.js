import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import FileViewer from './fileviewer'; // Yolunuz doğru olduğundan emin olun
import CustomImageButton from '../button/imageButton'; 

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function FeaturedImageUpload({handleFeaturedImage}) {
    const [open, setOpen] = useState(false);
    const [selectedImage,setSelectedImage] = useState();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFileSelect = (file) => {
        setSelectedImage(file); 
        // FileViewer'dan seçilen dosya ile yapılacak işlemler
        handleFeaturedImage(file)
        handleClose();
        // İşlemler...
    };

    const handleUploadComplete = () => {
        // Dosya yükleme tamamlandığında yapılacak işlemler
        console.log("Yükleme tamamlandı!");
        // İşlemler...
    };

    return (
        <div>
            <CustomImageButton
                image={selectedImage?.thumbnails || require('../../images/files/add-image.png')} // Koşullu ifade
                title="Öne Çıkarılan Görsel Seç" // Buton üzerinde görünecek metin
                onClick={handleClickOpen} // Dosya yöneticisini açacak fonksiyon
            />
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: 'relative', width: '100%',maxWidth: '100%' }}>
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
                    initialFile={selectedImage}
                    funcButton={{
                        text: "Seçilen Resmi Ekle",
                        onClick: () => {
                            // Seçilen resmi içeriğe ekleme veya içerik state'ini güncelleme işlemleri
                            console.log("Resim eklendi", selectedImage);
                            // Örneğin, seçilen resmin URL'sini içerik state'ine ekleyebilirsiniz
                            // setContent(prevContent => `${prevContent}\n![resim](${selectedImageUrl})`);
                        }
                    }} />
            </Dialog>
        </div>
    );
}

export default FeaturedImageUpload;
