import React, { useState, useEffect, useCallback } from 'react';
import {  useParams } from 'react-router-dom';
import { Grid, TextField, Button, Autocomplete, Chip,Typography, FormControl, Select, InputLabel, MenuItem, Paper, Stack, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditorWrapper from '../components/lexical/playground';
import {
    checkSlugAvailability, getAllCategories, getAllPeriods, createContent, getContentById, updateContent,
    searchTags, createTag
} from '../api';
import slugify from 'slugify';
import { debounce } from 'lodash';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { $generateNodesFromDOM } from "@lexical/html";
import { createEditor } from "lexical";
import { $getRoot } from 'lexical';
import 'moment/locale/tr';

import FeaturedImageUpload from '../components/file/featuredImage';
import PreviewLink from '../components/PreviewLink';

const ContentPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [contentId, setContentId] = useState(id || null);
    const [content, setContent] = useState(''); // İçeriği JSON formatında saklar
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [isSlugValid, setIsSlugValid] = useState(true);
    const [isSlugEditable, setIsSlugEditable] = useState(false);
    const [seoDescription, setSeoDescription] = useState('');
    const [publishDate, setPublishDate] = useState(moment());
    const [publicationStatus, setPublicationStatus] = useState('published');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [spot, setSpot] = useState('');
    const [featuredMedia, setFeaturedMedia] = useState(null);
    const [initialContent, setInitialContent] = useState(''); // İçeriği JSON formatında saklar
    const [currentContent, setCurrentContent] = useState({ json: '', html: '' }); // İçeriği tutar
    const [tags, setTags] = useState([]); // Seçilen etiketler
    const [availableTags, setAvailableTags] = useState([]);
    const [inputValue, setInputValue] = useState(''); // Kullanıcının Autocomplete'e yazdığı değer
  const [noOptions, setNoOptions] = useState(false);
  const [loading, setLoading] = useState(false); // Button'u işlevsiz hale getirmek için state
const [error, setError] = useState(null); 

    useEffect(() => {
        const fetchContent = async () => {
            if (contentId) {
                try {
                    const contentData = await getContentById(contentId);
                    console.log(contentData)
                    setTitle(contentData.title);
                    setSlug(contentData.slug);
                    setSeoDescription(contentData.metaDescription);
                    setPublishDate(moment(contentData.publishDate));
                    setPublicationStatus(contentData.status);
                    setSelectedCategories(contentData.categories);
                    setSpot(contentData.spot);
                    // setSelectedPeriod(contentData.period || {});
                    // İçeriğin mevcut etiketlerini setTags'e kaydet
                    setTags(contentData.tags);

                    if (contentData.bodyJson) {
                        const parsedContent = JSON.parse(contentData.bodyJson);
                        setInitialContent(parsedContent); // İlk içeriği ayarla
                    } else if (contentData.bodyHtml) {
                        setInitialContent(contentData.bodyHtml)
                        // const editor = createEditor();
                        //  const parser = new DOMParser();
                        // const dom = parser.parseFromString(contentData.bodyHtml, "text/html");
                        // // Yalnızca body içeriğini kullan
                    //      const body = dom.body;
                    //      console.log("dom:",body )
                    //     editor.update(() => {
                    //         const nodes = $generateNodesFromDOM(editor, dom);
                    //         console.log(nodes)
                    //         // Kök düğüm yapısını oluşturun
                    //         const rootNode = {
                    //             root: {
                    //                 children: nodes,  // Düğümleri JSON formatında ekle
                    //                 direction: "ltr",  // Yön
                    //                 format: "",        // Biçim
                    //                 indent: 0,         // Girinti
                    //                 type: "root",      // Düğüm tipi
                    //                 version: 1         // Versiyon
                    //             }
                    // };
                    //         // const jsonContent = editor.getEditorState().toJSON();
                    //         console.log("json:" , JSON.stringify(rootNode))
                    //         setInitialContent(JSON.stringify(rootNode));
                    //     },{ discrete: true });

                           // HTML içeriği varsa, bunu Lexical JSON'a dönüştür
                        // Create a parser function.
                        // const dom = new JSDOM(contentData.bodyHtml);
                        // const editor = createHeadlessEditor();
                        // const parser = new DOMParser();
                        // const dom = parser.parseFromString(contentData.bodyHtml, "text/html" );
                        // console.log(dom.body)
                        // // Once you have the DOM instance it's easy to generate LexicalNodes.
                        // const nodes = $generateNodesFromDOM(editor, dom.body);

                        // console.log(nodes)

                    } else {
                        setInitialContent(''); // Hiçbir içerik yoksa boş string olarak ayarla
                    }

                    if (contentData.featuredMedia) {
                        setFeaturedMedia(contentData.featuredMedia);
                    }
                    if (contentData.period) {
                        setSelectedPeriod(contentData.period);
                    }
                } catch (error) {
                    console.error('Error fetching content:', error);
                }
            }
        };

        getAllCategories().then(setCategories).catch(console.error);
        getAllPeriods().then((periodsData)=>setPeriods(periodsData.periods || [])).catch(console.error);
        fetchContent();
       

    }, [contentId]);

    const handleTitleChange = (event) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        if (!isSlugEditable) {
            const newSlug = slugify(newTitle, { lower: true, strict: true }).replace(/\./g, '-');
            setSlug(newSlug);
            checkSlugDebounced(newSlug);
        }
    };

    const checkSlugDebounced = useCallback(debounce(async (slugValue) => {
        try {
            const { available } = await checkSlugAvailability(slugValue);
            setIsSlugValid(available);
        } catch (error) {
            console.error('Error checking slug:', error);
            setIsSlugValid(false);
        }
    }, 500), []);

    const handleEditSlug = () => {
        setIsSlugEditable(true);
    };

    const handleSlugBlur = () => {
        checkSlugDebounced(slug);
        setIsSlugEditable(false);
    };

    const handlePublishClick = async () => {
        setLoading(true);
        setError(null); // Hata mesajını sıfırla
        const formData = {
            title,
            slug,
            bodyJson: JSON.stringify(currentContent.json), // JSON string olarak saklanacak
            bodyHtml: currentContent.html,
            metaDescription: seoDescription,
            spot,
            status: publicationStatus,
            publishDate: publishDate.toISOString(),
            categories: selectedCategories.map(category => category._id),
            tags: tags.map(tag => tag._id),
            featuredMedia,
        };

        if (selectedPeriod) {
            formData.period = selectedPeriod;
        }

        try {
            let response;
            if (contentId) {
                response = await updateContent(contentId, formData);
            } else {
                response = await createContent(formData);
            }

            if (response && response._id) {
                setContentId(response._id);
            }
        }catch (error) {
            console.error('Error saving content:', error);
            setError(error.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false); // İşlem tamamlanınca loading'i kapat
        }
    };

    // const handleContentChange = (jsonContent) => {
    //     setContent(jsonContent);
    // };

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategories(newValue);
    };

    // Öne çıkarılmış görsel seçme fonksiyonu
    const handleFeaturedImageSelect = (image) => {
        console.log(image)
        setFeaturedMedia(image);
    };

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
        // setContent(newContent);

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

    const getContent = (content) => {
        setCurrentContent(content);
        // SEO açıklaması için 160 karakterlik içeriği ayarla
        const parsedContent = JSON.parse(content.json);
        let first160Chars = '';
        if (parsedContent.root && parsedContent.root.children.length > 0) {
            first160Chars = extractTextContent(parsedContent.root.children).slice(0, 160);
        }
        setSeoDescription(first160Chars);
    };

    const handleTagChange = async (event, newValue) => {
        const lastTag = newValue[newValue.length - 1];

        // // Yeni bir tag girildiyse ve mevcut tag'ler arasında yoksa oluştur
        // if (lastTag && typeof lastTag === 'string') {
        //     const createdTag = await createTag(lastTag);
        //     if (createdTag) {
        //         newValue[newValue.length - 1] = createdTag; // Yeni oluşturulan tag'ı değere ekle
        //     }
        // }

        setTags(newValue); // Seçilen tag'leri güncelle
    };

    const handleTagSearch = async (query) => {
        if (query) {
          const results = await searchTags(query);
          setAvailableTags(results);
          setNoOptions(results.length === 0); // Eğer sonuç yoksa noOptions true olur
        } else {
          setAvailableTags([]);
          setNoOptions(false);
        }
      };

    const handleCreateTag = async () => {
        const createdTag = await createTag(inputValue);
        if (createdTag) {
          setTags([...tags, createdTag]);
          setAvailableTags([...availableTags, createdTag]);
          console.log([...tags, createdTag])
          setInputValue(''); // Girdi alanını temizle
          setNoOptions(false); // No options durumunu sıfırla
        }
      };
    return (
        <Container maxWidth="lg">
        <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12} md={9}>
                <TextField
                    label="Başlık"
                    variant="outlined"
                    value={title}
                    onChange={handleTitleChange}
                    fullWidth
                    InputProps={{ style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                />
                <TextField
                    label="Spot"
                    variant="outlined"
                    value={spot}
                    onChange={(e) => setSpot(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                />
                <EditorWrapper initialContent={initialContent} getContent={getContent} />
                <TextField
                    label={`Özet/description ${160 }`}
                    variant="outlined"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    sx={{ mt: 2 }}
                />

            </Grid>

            <Grid item xs={12} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handlePublishClick}
                        fullWidth
                        sx={{ mb: 3 }}
                        disabled={loading} // loading sırasında button işlevsiz
                    >
                        {loading ? 'İşlem Yapılıyor...' : contentId ? 'Güncelle' : 'Yayınla'}
                    </Button>

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <PreviewLink contentId={contentId} />
                    
                <Paper style={{ maxHeight: 'calc(120vh - 100px)', overflowY: 'auto', paddingTop: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
                                <Stack spacing={3} sx={{ minWidth: "100%" }}>
                                    <DateTimePicker
                                        label="Yayın Tarihi ve Saati"
                                        value={publishDate}
                                        onChange={(value) => setPublishDate(value)}
                                        ampm={false}
                                        inputFormat="DD/MM/YYYY HH:mm"
                                    />
                                </Stack>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
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
                                        <Button onClick={handleEditSlug}>Düzenle</Button>
                                    ),
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                        <Grid item xs={12}>
                            <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <FeaturedImageUpload handleFeaturedImage={handleFeaturedImageSelect} initialFile={featuredMedia} />
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                id="categories-outlined"
                                options={categories}
                                getOptionLabel={(option) => option.name}
                                value={selectedCategories}
                                onChange={handleCategoryChange}
                                filterSelectedOptions
                                clearOnEscape={false} // ESC tuşu ile temizleme işlevini devre dışı bırak
                                clearIcon={null} // Temizleme ikonunu kaldır
                                isOptionEqualToValue={(option, value) => option._id === value._id} // Burada _id üzerinden eşitlik karşılaştırması yapıyoruz
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip variant="outlined" key={option._id +'__'+index}  label={option.name} {...getTagProps} />
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
                                sx={{ mt: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={periods}
                                getOptionLabel={(option) => {
                                    const startDateFormatted = option.startDate ? new Date(option.startDate).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    }) : '';

                                    const endDateFormatted = option.endDate ? new Date(option.endDate).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    }) : '';

                                    return option?.name ? `${option.name} (${startDateFormatted} - ${endDateFormatted})` : '';
                                }}
                                onChange={(event, newValue) => setSelectedPeriod(newValue)}
                                isOptionEqualToValue={(option, value) => option?._id == value?._id} // Daha güvenli karşılaştırma
                                 value={selectedPeriod} // Value olarak object set etme
                                renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" />}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={availableTags}
                                getOptionLabel={(option) => option.name}
                                value={tags}
                                onChange={handleTagChange}
                                filterSelectedOptions
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                    handleTagSearch(newInputValue);
                                  }}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip variant="outlined" key={index} label={option.name} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Etiketler"
                                        placeholder="Etiket seç veya ekle"
                                    />
                                )}
                                noOptionsText={noOptions ? (
                                    <div>
                                      <p>Sonuç bulunamadı.</p>
                                      <Button variant="outlined" color="primary" onClick={handleCreateTag}>
                                        "{inputValue}" adlı yeni etiket oluştur
                                      </Button>
                                    </div>
                                  ) : "Sonuç bulunamadı."}
                                  sx={{ mt: 2 }}
                                />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
        </Container>
    );
};

export default ContentPage;
