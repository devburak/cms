import React from 'react';
import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 200,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

export default function CustomImageButton({
  image,
  onClick,
  title,
  sx = {}, // Material-UI `sx` propunu desteklemek için
  ...props // Diğer Material-UI ButtonBase özellikleri
}) {
  return (
    <ImageButton
      focusRipple
      onClick={onClick}
      sx={{ ...sx }} // Kullanıcının `sx` ile gönderdiği stilleri destekle
      {...props} // Diğer Material-UI özelliklerini destekle
    >
      <ImageSrc style={{ backgroundImage: `url(${image})` }} />
      <ImageBackdrop className="MuiImageBackdrop-root" />
      <Typography
        component="span"
        variant="subtitle1"
        color="inherit"
        sx={{
          position: 'relative',
          p: 4,
          pt: 2,
          pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
        }}
      >
        {title}
      </Typography>
    </ImageButton>
  );
}

// Varsayılan Props
CustomImageButton.defaultProps = {
  image: '', // Varsayılan boş bir görsel
  onClick: () => {}, // Varsayılan olarak tıklama fonksiyonu boş
  title: '', // Varsayılan başlık boş
};
