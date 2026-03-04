import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Grid,
    TextField,
    Button,
    Autocomplete,
    Chip,
    Typography,
    MenuItem,
    Paper,
    Stack,
    Container,
    Alert
} from '@mui/material';
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
import 'moment/locale/tr';

import FeaturedImageUpload from '../components/file/featuredImage';
import PreviewLink from '../components/PreviewLink';
import ContentVersionPanel from '../components/content/ContentVersionPanel';
import { useAuth } from '../context/AuthContext';
import { notifyError, notifySuccess } from '../services/notificationBus';

const MAX_META_DESCRIPTION_LENGTH = 160;

function getSeoDescriptionFromJson(jsonString) {
    if (!jsonString) {
        return '';
    }

    try {
        const parsedContent = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        if (!parsedContent?.root?.children?.length) {
            return '';
        }

        const extractTextContent = (nodes) => {
            let textContent = '';

            for (const node of nodes) {
                if (node.type === 'text') {
                    textContent += node.text;
                } else if (node.children?.length) {
                    textContent += extractTextContent(node.children);
                }

                if (textContent.length >= MAX_META_DESCRIPTION_LENGTH) {
                    break;
                }
            }

            return textContent;
        };

        return extractTextContent(parsedContent.root.children).slice(0, MAX_META_DESCRIPTION_LENGTH);
    } catch (error) {
        return '';
    }
}

const ContentPage = () => {
    const { id } = useParams();
    const { hasPermission } = useAuth();
    const [contentId, setContentId] = useState(id || null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [originalSlug, setOriginalSlug] = useState('');
    const [isSlugValid, setIsSlugValid] = useState(true);
    const [slugConflict, setSlugConflict] = useState(null);
    const [isSlugEditable, setIsSlugEditable] = useState(false);
    const [seoDescription, setSeoDescription] = useState('');
    const [publishDate, setPublishDate] = useState(moment());
    const [publicationStatus, setPublicationStatus] = useState('published');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [spot, setSpot] = useState('');
    const [featuredMedia, setFeaturedMedia] = useState(null);
    const [initialContent, setInitialContent] = useState('');
    const [currentContent, setCurrentContent] = useState({ json: '', html: '' });
    const [tags, setTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [noOptions, setNoOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editorResetKey, setEditorResetKey] = useState(0);
    const [versionRefreshKey, setVersionRefreshKey] = useState(0);

    const canCreateContent = hasPermission('createContent');
    const canUpdateContent = hasPermission('updateContent');
    const canSaveContent = contentId ? canUpdateContent : canCreateContent;
    const canViewVersions = hasPermission('viewContentVersions');

    const fetchContentData = useCallback(async (targetContentId = contentId) => {
        if (!targetContentId) {
            return;
        }

        try {
            const contentData = await getContentById(targetContentId);
            setTitle(contentData.title || '');
            setSlug(contentData.slug || '');
            setOriginalSlug(contentData.slug || '');
            setSlugConflict(null);
            setSeoDescription((contentData.metaDescription || '').slice(0, MAX_META_DESCRIPTION_LENGTH));
            setPublishDate(contentData.publishDate ? moment(contentData.publishDate) : moment());
            setPublicationStatus(contentData.status || 'published');
            setSelectedCategories(contentData.categories || []);
            setSpot(contentData.spot || '');
            setTags(contentData.tags || []);
            setFeaturedMedia(contentData.featuredMedia || null);
            setSelectedPeriod(contentData.period || null);

            const nextInitialContent = contentData.bodyJson || contentData.bodyHtml || '';
            setInitialContent(nextInitialContent);
            setCurrentContent({
                json: contentData.bodyJson || '',
                html: contentData.bodyHtml || ''
            });
            setEditorResetKey((prev) => prev + 1);
        } catch (fetchError) {
            console.error('Error fetching content:', fetchError);
        }
    }, [contentId]);

    useEffect(() => {
        getAllCategories().then(setCategories).catch(console.error);
        getAllPeriods().then((periodsData)=>setPeriods(periodsData.periods || [])).catch(console.error);
    }, []);

    useEffect(() => {
        fetchContentData();
    }, [fetchContentData]);

    const handleTitleChange = (event) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        if (!isSlugEditable) {
            const newSlug = slugify(newTitle, { lower: true, strict: true }).replace(/\./g, '-');
            setSlug(newSlug);
            checkSlugDebounced(newSlug);
        }
    };

    const findAvailableSlug = async (baseSlug) => {
        const { available } = await checkSlugAvailability(baseSlug);
        if (available) {
            return { slug: baseSlug, isOriginal: true };
        }

        const slugWithoutNumber = baseSlug.replace(/-\d+$/, '');

        for (let i = 1; i <= 100; i++) {
            const newSlug = `${slugWithoutNumber}-${i}`;
            try {
                const { available: isAvailable } = await checkSlugAvailability(newSlug);
                if (isAvailable) {
                    return { slug: newSlug, isOriginal: false };
                }
            } catch (error) {
                console.error(`Error checking slug ${newSlug}:`, error);
            }
        }
        
        return { slug: baseSlug, isOriginal: false };
    };

    const checkSlugDebounced = useCallback(debounce(async (slugValue, autoFix = true) => {
        if (contentId && slugValue === originalSlug) {
            setIsSlugValid(true);
            setSlugConflict(null);
            return;
        }

        try {
            const { available, conflict } = await checkSlugAvailability(slugValue);
            if (available) {
                setIsSlugValid(true);
                setSlugConflict(null);
            } else if (autoFix && !isSlugEditable) {
                const { slug: availableSlug, isOriginal } = await findAvailableSlug(slugValue);
                if (!isOriginal) {
                    setSlug(availableSlug);
                }
                setIsSlugValid(true);
                setSlugConflict(null);
            } else {
                setIsSlugValid(false);
                setSlugConflict(conflict || null);
            }
        } catch (error) {
            console.error('Error checking slug:', error);
            setIsSlugValid(false);
            setSlugConflict(null);
        }
    }, 500), [contentId, isSlugEditable, originalSlug]);

    const handleEditSlug = () => {
        setIsSlugEditable(true);
    };

    const handleSlugBlur = () => {
        checkSlugDebounced(slug, false);
        setIsSlugEditable(false);
    };

    const handlePublishClick = async () => {
        if (!canSaveContent) {
            notifyError(contentId ? 'Bu icerigi guncelleme yetkiniz yok.' : 'Yeni icerik olusturma yetkiniz yok.');
            return;
        }

        setLoading(true);
        setError(null);
        const formData = {
            title,
            slug,
            bodyJson: currentContent.json || '',
            bodyHtml: currentContent.html || '',
            metaDescription: seoDescription.slice(0, MAX_META_DESCRIPTION_LENGTH),
            spot,
            status: publicationStatus,
            publishDate: publishDate?.toISOString?.() || new Date().toISOString(),
            categories: selectedCategories.map(category => category._id),
            tags: tags.map(tag => tag._id),
            featuredMedia,
        };

        if (selectedPeriod) {
            formData.period = selectedPeriod._id || selectedPeriod;
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
                setOriginalSlug(response.slug || slug);
            }
            setVersionRefreshKey((prev) => prev + 1);
            notifySuccess(contentId ? 'Icerik guncellendi.' : 'Icerik olusturuldu.');
        } catch (saveError) {
            console.error('Error saving content:', saveError);
            const message = saveError?.response?.data?.message || saveError?.message || 'Bir hata olustu.';
            setError(message);
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategories(newValue);
    };

    const handleFeaturedImageSelect = (image) => {
        setFeaturedMedia(image);
    };

    const getContent = (content) => {
        setCurrentContent(content);

        const nextSeoDescription = getSeoDescriptionFromJson(content?.json);
        if (nextSeoDescription) {
            setSeoDescription(nextSeoDescription);
        }
    };

    const handleTagChange = async (event, newValue) => {
        setTags(newValue);
    };

    const handleTagSearch = async (query) => {
        if (query) {
          const results = await searchTags(query);
          setAvailableTags(results);
          setNoOptions(results.length === 0);
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
          setInputValue('');
          setNoOptions(false);
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
                <EditorWrapper
                    key={`content-editor-${contentId || 'new'}-${editorResetKey}`}
                    initialContent={initialContent}
                    getContent={getContent}
                />
                <TextField
                    label={`Özet/description ${MAX_META_DESCRIPTION_LENGTH}`}
                    variant="outlined"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value.slice(0, MAX_META_DESCRIPTION_LENGTH))}
                    multiline
                    minRows={3}
                    fullWidth
                    inputProps={{ maxLength: MAX_META_DESCRIPTION_LENGTH }}
                    helperText={`${seoDescription.length}/${MAX_META_DESCRIPTION_LENGTH}`}
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
                        disabled={loading || !canSaveContent}
                    >
                        {loading ? 'İşlem Yapılıyor...' : contentId ? 'Güncelle' : 'Yayınla'}
                    </Button>

                    {!canSaveContent ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {contentId
                                ? 'Bu icerigi guncelleme yetkiniz yok.'
                                : 'Yeni icerik olusturma yetkiniz yok.'}
                        </Alert>
                    ) : null}

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
                                helperText={
                                    !isSlugValid
                                        ? slugConflict?.type === 'category'
                                            ? `Bu slug bir kategori tarafindan kullaniliyor: ${slugConflict.label}`
                                            : slugConflict?.type === 'content'
                                                ? `Bu slug baska bir sayfada kullaniliyor: ${slugConflict.label}`
                                                : 'Bu slug zaten kullaniliyor.'
                                        : ''
                                }
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
                {canViewVersions ? (
                    <ContentVersionPanel
                        contentId={contentId}
                        refreshKey={versionRefreshKey}
                        onRestored={async () => {
                            await fetchContentData(contentId);
                            setVersionRefreshKey((prev) => prev + 1);
                        }}
                    />
                ) : null}
            </Grid>
        </Grid>
        </Container>
    );
};

export default ContentPage;
