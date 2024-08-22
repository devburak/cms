import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Autocomplete, Chip, IconButton, Paper, FormControl, Select, InputLabel, TextField, MenuItem, Button, Stack } from '@mui/material';
import Playground from '../components/lexical/playground';
import FeaturedImageUpload from '../components/file/featuredImage';
import slugify from 'slugify';
import EditIcon from '@mui/icons-material/Edit';
import { checkSlugAvailability, getAllCategories, getPeriods,createContent } from '../api';
import { debounce } from 'lodash';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import { calculateByteSize } from '../utils/file';
import 'moment/locale/tr';

const ContentPage = () => {
    const { t } = useTranslation();

    if (moment.locale() !== 'tr') {
        moment.locale('tr');
    }

    // İçerik için state tanımla
    const [content, setContent] = useState('');

    // Öne çıkarılmış görsel için state tanımla
    const [featuredImage, setFeaturedImage] = useState(null);
    // Başlık için state
    const [title, setTitle] = useState('');
    // Slug için state
    const [slug, setSlug] = useState('');
    const [isSlugValid, setIsSlugValid] = useState(true);
    const [isContentSaved, setIsContentSaved] = useState(false); // Örnek olarak false

    // Slug'ın düzenlenip düzenlenemeyeceğini kontrol eden state
    const [isSlugEditable, setIsSlugEditable] = useState(false);

    const [contentId, setContentId] = useState(null)
    const [seoDescription, setSeoDescription] = useState('');

    const [publishDate, setPublishDate] = useState(moment());
    const [publicationStatus, setPublicationStatus] = useState('published');

    // Kategoriler için state tanımla
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [spot,setSpot] = useState('')

    const extractTextContent = (nodes) => {
        let textContent = '';
        for (const node of nodes) {
            if (node.type === 'text') {
                textContent += node.text;
            } else if (node.children && node.children.length > 0) {
                textContent += extractTextContent(node.children);
            }
            if (textContent.length >= 160) {
                break; // 160 karaktere ulaşıldığında döngüyü durdur
            }
        }
        return textContent;
    };

    const handleContentChange = (newContent) => {
        // Yeni içeriği state'e kaydet veya gereken işlemleri yap
        // console.log("New content: ", newContent);
        setContent(newContent);

        // Yeni içeriği JSON olarak parse et
        const parsedContent = JSON.parse(newContent);

        // İlk 160 karakteri alacak şekilde metni topla
        let first160Chars = '';
        if (parsedContent.root && parsedContent.root.children.length > 0) {
            first160Chars = extractTextContent(parsedContent.root.children).slice(0, 160);
        }

        // SEO açıklamasını güncelle
        setSeoDescription(first160Chars);
    };

    // Öne çıkarılmış görsel seçme fonksiyonu
    const handleFeaturedImageSelect = (image) => {
        setFeaturedImage(image);
    };
    // Başlık değiştiğinde çağrılan fonksiyon
    const handleTitleChange = (event) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        if (!isContentSaved || isSlugEditable) {
            let newSlug = slugify(newTitle, { lower: true, strict: true });
            newSlug = newSlug.replace(/\./g, '-'); // Noktaları kaldır
            setSlug(newSlug);
            // Slug kontrol fonksiyonunu çağır
            checkSlugDebounced(newSlug);
        }
    };
    // Slug kontrol fonksiyonu

    const checkSlugDebounced = useCallback(debounce(async (slugValue) => {
        try {
            const { available } = await checkSlugAvailability(slugValue);
            setIsSlugValid(available);
        } catch (error) {
            console.error('Error checking slug:', error);
            setIsSlugValid(false);
        }
    }, 1000), []); // 1000ms bekleme süresi


    // Slug düzenleme butonu fonksiyonu
    const handleEditSlug = () => {
        setIsSlugEditable(true);
    };

    // Slug kontrol fonksiyonu
    const handleSlugBlur = () => {
        checkSlugDebounced(slug);
        setIsSlugEditable(false); // Slug düzenleme modunu kapat
    };

    const handlePublishClick = async () => {

        const contentObj = JSON.parse(content);
        // `period` seçilmişse formData'ya dahil et, değilse atla
        const byteSize = calculateByteSize(content);
        const sizeInMB = byteSize / (1024 * 1024); // Byte cinsinden boyutu MB cinsine dönüştür

        if (sizeInMB > 10) {
            alert(`İçerik boyutu 10 MB üzerindedir: ${sizeInMB.toFixed(2)} MB`);
        } else {
            console.log(`İçerik boyutu 10 MB altındadır. ${sizeInMB.toFixed(2)} MB`);
        }

        let formData = {
            title,
            slug,
            categories: selectedCategories.map(category => category._id), // Kategori ID'lerini al
            status: publicationStatus,
            publishedDate: publishDate.toISOString(), // Tarih formatını ISO string olarak ayarla
            images: featuredImage ? [featuredImage._id] : [], // Görsel seçilmişse ID'sini diziye al
            summary: seoDescription,
            root:contentObj.root,// Lexical içerik yapısı
            spot:spot
        };
    
        if (selectedPeriod) { // `period` seçilmişse formData'ya ekle
            formData.period = selectedPeriod;
        }
    
        console.log(formData);
        try {
            // Form verisini API'ye gönder
            const response = await createContent(formData);
            if (response && response._id) {
                setContentId(response._id); // Dönen içeriğin ID'sini state'e ata
                setIsContentSaved(true); // İçeriğin kaydedildiğini belirten state'i güncelle
            }
            console.log('Content created:', response);
            // Başarılı işlem sonrası işlemler...
        } catch (error) {
            console.error('Creating content failed:', error);
            // Hata işlemleri...
            alert('HATA oluştu');
        }
    
        // setIsContentSaved(true);
    };
    
    useEffect(() => {
        // Kategorileri fetch eden fonksiyon
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response); // API'den gelen kategorileri state'e ata
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        const fetchPeriods = async () => {
            try {
                const response = await getPeriods();
                setPeriods(response); // API'den gelen dönemleri state'e ata
            } catch (error) {
                console.error('Error fetching periods:', error);
            }
        };

        fetchPeriods();
        fetchCategories();
    }, []);

    // Kategori seçimi için handleChange fonksiyonu
    const handleCategoryChange = (event, newValue) => {
        setSelectedCategories(newValue);
    };
    const handlePeriodChange = (event) => {
        setSelectedPeriod(event.target.value);
    };


    // Başlık değiştiğinde çağrılan fonksiyon
    const handleSpotChange = (event) => {
        const newSpot = event.target.value;
        setSpot(newSpot);
        
    };

    return (
        <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <TextField
                            label="Başlık"
                            variant="outlined"
                            value={title}
                            onChange={handleTitleChange}
                            fullWidth
                            InputProps={{
                                style: {
                                    fontSize: '1.5rem', // Metin boyutu
                                    fontWeight: 'bold',  // Metin kalınlığı
                                    // Diğer stil özellikleri
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} >
                        <TextField
                            label="Spot"
                            variant="outlined"
                            value={spot}
                            onChange={handleSpotChange}
                            fullWidth
                            multiline={true}
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Playground onContentChange={handleContentChange} content={content} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={`Özet/description ${160 - seoDescription.length || 0}`}
                            variant="outlined"
                            value={seoDescription}
                            onChange={(e) => setSeoDescription(e.target.value)}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                    </Grid>
                </Grid>

            </Grid>

            <Grid item xs={12} md={3} style={{ minWidth: '200px' }}>
                <Grid container spacing={2} >
                    <Grid item xs={12}  sx={{ mb:3  }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size='large'
                            onClick={handlePublishClick}
                            fullWidth
                        >
                            {contentId ? 'Güncelle' : 'Yayınla'}
                        </Button>
                    </Grid>
                </Grid>
                <Paper style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                    <Grid container spacing={2} >

                        <Grid item xs={12}  sx={{ mx:3  }}>
                            {t('Özellikler alanı')}
                        </Grid>
                        <Grid item xs={12} sx={{ mx:3  }}>
                            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
                                <Stack spacing={3} sx={{ minWidth: "100%" }}>
                                    <DateTimePicker
                                        label="Yayın Tarihi ve Saati"
                                        value={publishDate}
                                        onChange={(value) => setPublishDate(value)}
                                        ampm={false} // 24 saat formatını kullan
                                        inputFormat="DD/MM/YYYY HH:mm" // Tarih ve saat formatını ayarla
                                    />

                                </Stack>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sx={{ mx:3  }}>
                            <TextField
                                label="Slug"
                                variant="outlined"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                onBlur={handleSlugBlur}
                                disabled={!isSlugEditable}
                                error={!isSlugValid}
                                helperText={!isSlugValid && "Bu slug zaten kullanılıyor."}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={handleEditSlug}>
                                            <EditIcon />
                                        </IconButton>
                                    ),
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mx:3  }}>
                            <TextField
                                select
                                label="Yayın Durumu"
                                value={publicationStatus}
                                onChange={(e) => setPublicationStatus(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="draft">Taslak</MenuItem>
                                <MenuItem value="published">Yayında</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sx={{ mx:3  }}>
                            <div style={{ border: '1px solid #ddd', padding: '10px' }}>

                                <FeaturedImageUpload handleFeaturedImage={handleFeaturedImageSelect} />
                            </div>
                        </Grid>
                        <Grid item xs={12}  sx={{ mx:3  }}>

                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={categories}
                                getOptionLabel={(option) => option.title}
                                value={selectedCategories}
                                onChange={handleCategoryChange}
                                filterSelectedOptions
                                clearOnEscape={false} // ESC tuşu ile temizleme işlevini devre dışı bırak
                                clearIcon={null} // Temizleme ikonunu kaldır
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip variant="outlined" label={option.title} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Kategoriler"
                                        placeholder="Kategori seç"
                                    />
                                )}
                            />

                        </Grid>
                        <Grid item xs={12}  sx={{ mx:3 ,mb:10 }}>
                           
                                <FormControl fullWidth>
                                    <InputLabel id="period-select-label">Dönem</InputLabel>
                                    <Select
                                        labelId="period-select-label"
                                        id="period-select"
                                        value={selectedPeriod}
                                        label="Dönem"
                                        onChange={handlePeriodChange} >
                                        <MenuItem value={null}>
                                            <em>--</em>
                                        </MenuItem>
                                        {periods.map((period) => (
                                            <MenuItem key={period._id} value={period._id}>{period.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            
                        </Grid>

                    </Grid>
                </Paper>
            </Grid>
        </Grid>

    )
};

export default ContentPage;
