import React,{useState} from 'react';
import AddressForm from '../components/addressForm';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import AddressCard from '../components/addressCard';
import { Grid, Container, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

function AddressList() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFormSubmit = async (formData) => {
        // Form verilerini backend'e gönder
        // ...
        console.log(formData)
        // Başarılı bir şekilde gönderildiyse modalı kapat
        handleClose();
    };


    const sampleAddress = {
        name: 'Ev Adresim',
        fullAddress: '1234 Elm Street, Springfield, IL, 12345',
        isUsed:false
    };

    const addresses = [sampleAddress, sampleAddress, sampleAddress,sampleAddress, sampleAddress, sampleAddress,]; // Örnek olarak aynı adresi birkaç kez ekledim. Gerçekte kendi adreslerinizi ekleyin.

    return (
        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Grid container spacing={2} wrap="nowrap">
                <Grid item style={{ display: 'inline-flex', alignItems:"center" }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="1px dashed gray"
                        borderRadius="4px"
                        sx={{ width: '200px', height: '130px' }} // Bu değerleri AddressCard bileşeninizin genişliği ve yüksekliği ile eşleştirmeniz gerekebilir.
                    >
                        <Button startIcon={<AddIcon />} variant="outlined"  onClick={handleOpen}>
                            {t("add")}
                        </Button>
                    </Box>
                </Grid>
                {addresses.map((address, index) => (
                    <Grid item key={index} style={{ display: 'inline-flex' }}>
                        <AddressCard
                            address={address}
                            onIsUsed={()=>console.log(address.isUsed)}
                            onEdit={() => console.log(index)}
                            onView={() => console.log(address)}
                            onDelete={() => console.log('Delete')}
                        />
                    </Grid>
                ))}

            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{t("add_address")}</DialogTitle>
                <DialogContent>
                    <AddressForm onSubmit={handleFormSubmit} />
                </DialogContent>
            </Dialog>
        </div>
    );
}


const Profile = () => {





    return (
        <Container maxWidth="lg">
            <AddressList />
        </Container>
    )
};

export default Profile;
