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

export const getInlinePngIcon = (fileExtension) => {
  try {
    // Dosya türüne göre Base64 formatında PNG ikonları
    switch (fileExtension) {
      case 'pdf':
        return `data:image/png;base64,${btoa(`
          iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABQklEQVQ4T82SMWoCQRTG/4VId
          ARJgri0xQsRA4VZiIJY4AgW0Alkh5AdAA8QIgFARHYoQQEZgRCsAkpRtHEjxI4Uz9DLbsPPvvX
          uWXmCHD9EKCEosAal1WFmYXUAO2AV6rUVuKLqro2uCGdAeJSDHYgjoqsFwd+MZjluDTeVYLKZz
          3eAK6zAqcAlMfgeGFMpWTQQiEkOGUnrIVYZFqtFrv8C8TVVWyKP9gPo9gDoqzNGtVlgB1zCgmE
          2BQAgy+8MIGiMAxQqiRO7QZGo3LZldQVcCtAcgRpJcACOWY+hAt2wwhBDwAYysEriJG7gLOzbn
          tW4A+Yxn8EAkDpiixwibTTwF8c2P+XAVoB58V9HRONykX6GuBOUlWLyGuALp+AAAAAElFTkSuQmCC
        `)}`; // Base64 kodlanmış PNG (örnek bir PDF simgesi)
      case 'docx':
      case 'doc':
        return `data:image/png;base64,${btoa(`
          iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABXUlEQVQ4T62SQUoDQRCG32soB
          AwWE2VAgkYZMCFgiB3EHg0XIAmWoDAZA0OoFPIIBAROFcDGmJoGBUAVAhViiFPbqzcU2Sux0ox
          4lj8YN9uZs9XK7oIjey6sX9awDfskdOLfA00AMmC2UBmfFmCEAA8EQBwDDAU5BBE0EAA6egwYA
          cHQB3IoQDo9sAAYKYSoCLM3GYACeDQAwAgAOu7Af2RQJ+QA9FwnwHYxkMFfgC6McECXLAYwYCZ
          wAKTLBcVgIABtX0AMZIAgFguAFVdAQWphACrrQEXxQEKujAIoNfMBXJ1hBRz8F4bIlRBH3FYwK
          gb0Cx6sHnp4BjV0Bnq0DWQUAhzkNH5eBuBAABeNiFQUA2x88qlkh9ZYAAAAASUVORK5CYII=
        `)}`; // Base64 kodlanmış PNG (örnek bir DOC simgesi)
      case 'svg':
        return `data:image/png;base64,${btoa(`
          iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABP0lEQVQ4T82SMUoDQRBFvwUDz
          KoRQZAowLKFL0EByBwyZGUImEULMI2EuEPkM3GZTLdGblnDPn+3F2X1/dVLVZRBQGUazmm8RoO
          QAOsp0BeE4kjhwhBDMYDWFS+fXrXIlIL6CihmKjR4NMC6VLK7JoLB+FoAIFgItcXxP8IXoqjkC
          HZk1AOupSEp4Ah0Bl3UAHKgBVtYHzOnZX7+Ak+F6LGgSyAvkD6yBiSGg6VDJJCSMmkxRdIDMO
          kpZsxGKcIoqH0/jmwMwHAIcSEnQmAAkpo3YIOAIYFZCQLCQAAAABJRU5ErkJggg==
        `)}`; // Base64 kodlanmış PNG (örnek bir SVG simgesi)
      default:
        return `data:image/png;base64,${btoa(`
          iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEUlEQVQ4T82RMUoDQRBFn6EBh
          CwYEQuCEBLNQIP4EDIpDIEXYJRF4CIqDF2M+JuTa7Zkzu3bv7MwkV0cmRR2+LZVF6FlJMB+KlB
          A7oScmpVRJUHDcZptU9RPU9NxNVKoAvQN1TMR7DkDfiFeAMmjMIqkgDs9lgQMQjoZgIuoigBW
          7gKbKoBb+0NT+k6IIgV9YDkTQQAVJcAV44RhP8FDN44CtaIBJWBA2zLEU5r2lgA7HQBjy4Dcy
          c5XZUoDFsVLvkpS8q7AF3QMlwApo44OdMPEdO4yOnFTPCqlKcMOIFU/WJEMcpsfcp3Aiv7xAf
          WAAAAAElFTkSuQmCC
        `)}`; // Base64 kodlanmış PNG (varsayılan simge)
    }
  } catch (error) {
    console.error('Error generating inline PNG icon:', error);
    return null; // Hatalı durumlarda null döndür
  }
};

export const generateThumbnails = async (file) => {
  const sizes = [
    { size: 'small', width: 150, height: 150 },
    { size: 'medium', width: 300, height: 300 },
    { size: 'large', width: 600, height: 600 },
    { size: 'x-large', width: 1024, height: 1024 },
  ];

  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return Promise.all(
    sizes.map(({ size, width, height }) => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      const ratio = Math.min(width / imageBitmap.width, height / imageBitmap.height);
      const w = imageBitmap.width * ratio;
      const h = imageBitmap.height * ratio;
      const x = (width - w) / 2;
      const y = (height - h) / 2;
      ctx.drawImage(imageBitmap, x, y, w, h);
      return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve({ size, blob }), 'image/webp')
      );
    })
  );
};
