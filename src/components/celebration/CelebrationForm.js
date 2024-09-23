import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Stack,Autocomplete } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getCelebrationById, createCelebration, updateCelebration, getAllPeriods } from '../../api';
import EditorWrapper from '../lexical/playground'; // Lexical EditorWrapper'ı içe aktar

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import FeaturedImageUpload from '../file/featuredImage';
import 'moment/locale/tr';

const CelebrationForm = () => {
    const [celebration, setCelebration] = useState({ 
      title: '', 
      bodyHtml: '', 
      bodyJson: '', 
      period: {}, 
      eventDate: '', 
      publishDate: moment(), // Varsayılan olarak şu anki zaman
      type: 'tmmob', // Varsayılan değer olarak 'tmmob' seçili
      featuredImage: null,
    });
    const [periods, setPeriods] = useState([]); // Boş bir dizi ile başlat
    const [initialContent, setInitialContent] = useState(''); // İçeriği JSON formatında saklar
    const [currentContent, setCurrentContent] = useState({ json: '', html: '' }); // İçeriği tutar
    const navigate = useNavigate();
    const { id } = useParams();
  
    useEffect(() => {
        fetchPeriods();
      if (id) {
        fetchCelebration(id);
      }
    }, [id]);
  
    const fetchCelebration = async (id) => {
      try {
        const data = await getCelebrationById(id);
        setCelebration({
            ...data,
            publishDate: data.publishDate ? moment(data.publishDate) : null,
          });
        if (data.bodyJson) {
          setInitialContent(JSON.parse(data.bodyJson)); // JSON içeriği varsa ayarla
        } else if (data.bodyHtml) {
          setInitialContent(data.bodyHtml); // HTML içeriği varsa ayarla
        }
      } catch (error) {
        console.error('Error fetching celebration:', error);
      }
    };
  
    const fetchPeriods = async () => {
      try {
        const periodsData = await getAllPeriods();
        console.log(periodsData)
        setPeriods(periodsData.periods || []); // Eğer periodsData boş veya undefined ise, boş dizi olarak ayarla
      } catch (error) {
        console.error('Error fetching periods:', error);
        setPeriods([]); // Hata durumunda da periods'u boş dizi olarak ayarla
      }
    };
  
    const handleChange = (e) => {
      setCelebration({ ...celebration, [e.target.name]: e.target.value });
    };
  
    const handleDateChange = (date, field) => {
      setCelebration({ ...celebration, [field]: date });
    };
  
    const handleImageChange = (image) => {
        console.log(image)
      setCelebration({ ...celebration, featuredImage: image });
    };
  
    const handleSave = async () => {
      try {
        const celebrationData = {
          ...celebration,
          bodyJson: JSON.stringify(currentContent.json),
          publishDate: celebration.publishDate ? celebration.publishDate.toISOString() : null, // ISO string formatına dönüştür
          bodyHtml: currentContent.html,
        };
  
        if (id) {
          await updateCelebration(id, celebrationData);
        } else {
          await createCelebration(celebrationData);
        }
        navigate('/celebrations');
      } catch (error) {
        console.error('Error saving celebration:', error);
      }
    };

    const handlePeriodChange = (event, newValue) => {
        setCelebration({ ...celebration, period: newValue ? newValue : '' });
      };
  
    const getContent = (content) => {
      setCurrentContent(content); // JSON ve HTML içeriği ayarla
    };
  
    return (
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Başlık"
              variant="outlined"
              fullWidth
              name="title"
              value={celebration.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            {/* Lexical EditorWrapper */}
            <EditorWrapper initialContent={initialContent} getContent={getContent} />
          </Grid>
          {/* Dönem Seçimi */}
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
                        onChange={handlePeriodChange}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id} // Daha güvenli karşılaştırma
                        value={periods.find(p => p._id === celebration.period?._id) || null} // Value olarak object set etme
                        renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" />}
                        fullWidth
                    />
          </Grid>
          {/* PublishDate Seçici */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
              <Stack spacing={3} sx={{ minWidth: "100%" }}>
                <DateTimePicker
                  label="Yayın Tarihi ve Saati"
                  value={celebration.publishDate}
                  onChange={(date) => handleDateChange(date, 'publishDate')}
                  ampm={false}
                  inputFormat="DD/MM/YYYY HH:mm"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Stack>
            </LocalizationProvider>
          </Grid>
          {/* Event Date */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Olay Tarihi"
              required
              variant="outlined"
              fullWidth
              name="eventDate"
              value={celebration.eventDate}
              onChange={handleChange}
            />
          </Grid>
          {/* Featured Image Seçimi */}
          <Grid item xs={12}>
            <FeaturedImageUpload initialFile={celebration.featuredImage} handleFeaturedImage={handleImageChange} />
          </Grid>
          {/* Type Seçimi */}
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Tür Seç</InputLabel>
              <Select
                value={celebration.type}
                onChange={handleChange}
                name="type"
                label="Tür Seç"
              >
                <MenuItem value="dunya">DÜNYADA</MenuItem>
                <MenuItem value="turkiye">TÜRKİYE'DE</MenuItem>
                <MenuItem value="tmmob">TMMOB'DE</MenuItem>
                <MenuItem value="yayin">YAYINLAR</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  export default CelebrationForm;
