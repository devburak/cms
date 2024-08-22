// export const determineImageSource = (file) => {
//   try {
//     // Dosya uzantısını kontrol etmek için dosya adından uzantıyı ayırın
//     const fileType = file?.fileType || ''
//     const fileName = file.fileName || file.name;
//     const fileExtension = fileName.split('.').pop().toLowerCase();

//     // Resim dosya uzantıları
//     const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];

//     // Eğer dosya bir resim ise ve bir Blob/File ise, dosyanın kendisini görsel kaynak olarak kullanın
//     if (imageExtensions.includes(fileExtension) || fileType.includes(fileExtension)) {
//         if (file instanceof File || file instanceof Blob) {
//             return URL.createObjectURL(file);
//         }
//         return file.thumbnails?.size || file.fileUrl;
//     }

//     // Değilse, dosya türüne uygun bir simge veya görsel döndürün
//     switch (fileExtension) {
//         case 'pdf':
//             return require('../images/files/pdf.png');
//         case 'docx':
//         case 'doc':
//             return require('../images/files/word.png');
//         case 'svg':
//             return require('../images/files/svg.png');
//         default:
//             return require('../images/files/default.png');
//     }
//   } catch (error) {
//     console.error('Error determining image source:', error);
//     // Hatalı durumda hata görselini döndür
//     return require('../images/files/error.png');
//   }
// };


export const determineImageSource = (file) => {
  try {
    const fileType = file?.fileType || '';
    const fileName = file?.filename || file?.name || '';
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Resim dosya uzantıları
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    // Eğer dosya bir resimse ve thumbnail'lar arasında "small" varsa bu URL'i döndür
    if (imageExtensions.includes(fileExtension) || fileType.startsWith('image')) {
        const smallThumbnail = file.thumbnails?.find(thumb => thumb.size === 'small');
        if (smallThumbnail) {
            return smallThumbnail.url;
        }
        // Eğer thumbnail yoksa orijinal URL'i döndür
        return file.url;
    }

    // Dosya türüne uygun bir simge döndür
    switch (fileExtension) {
        case 'pdf':
            return require('../images/files/pdf.png');
        case 'docx':
        case 'doc':
            return require('../images/files/word.png');
        case 'svg':
            return require('../images/files/svg.png');
        default:
            return require('../images/files/default.png');
    }
  } catch (error) {
    console.error('Error determining image source:', error);
    // Hatalı durumda hata görselini döndür
    return require('../images/files/error.png');
  }
};

export const calculateByteSize=(string) =>{
  return new Blob([string]).size;
}