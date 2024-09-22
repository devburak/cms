import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Stack, Autocomplete } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getPeriodDocumentById, createPeriodDocument, updatePeriodDocument, getAllPeriods } from '../../api';
import EditorWrapper from '../lexical/playground'; // Lexical EditorWrapper'ı içe aktar

import moment from 'moment';

const PeriodDocumentForm = () => {
  const [document, setDocument] = useState({
    title: '',
    bodyHtml: '',
    bodyJson: '',
    period: {},
  });
  const [periods, setPeriods] = useState([]); // Dönemleri tutar
  const [initialContent, setInitialContent] = useState(''); // İçeriği JSON formatında saklar
  const [currentContent, setCurrentContent] = useState({ json: '', html: '' }); // İçeriği tutar
  const navigate = useNavigate();
  const { id } = useParams(); // Düzenleme için ID al

  useEffect(() => {
    fetchPeriods();
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  const fetchDocument = async (id) => {
    try {
      const data = await getPeriodDocumentById(id);
      setDocument({
        ...data,
        createdBy: data.createdBy || '',
        updatedBy: data.updatedBy || '',
      });
      console.log("doc" , data)
      if (data.bodyJson) {
        setInitialContent(JSON.parse(data.bodyJson)); // JSON içeriği varsa ayarla
      } else if (data.bodyHtml) {
        setInitialContent(data.bodyHtml); // HTML içeriği varsa ayarla
      }
    } catch (error) {
      console.error('Error fetching period document:', error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const periodsData = await getAllPeriods();
      setPeriods(periodsData.periods || []); // Eğer periodsData boş veya undefined ise, boş dizi olarak ayarla
    } catch (error) {
      console.error('Error fetching periods:', error);
      setPeriods([]); // Hata durumunda da periods'u boş dizi olarak ayarla
    }
  };

  const handleChange = (e) => {
    setDocument({ ...document, [e.target.name]: e.target.value });
  };

  const handlePeriodChange = (event, newValue) => {
    setDocument({ ...document, period: newValue ? newValue : '' });
  };

  const handleSave = async () => {
    try {
      const documentData = {
        ...document,
        bodyJson: JSON.stringify(currentContent.json),
        bodyHtml: currentContent.html,
      };

      if (id) {
        await updatePeriodDocument(id, documentData);
      } else {
        await createPeriodDocument(documentData);
      }
      navigate('/period-documents');
    } catch (error) {
      console.error('Error saving period document:', error);
    }
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
            value={document.title}
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
                const startYear = option.startDate ? new Date(option.startDate).getFullYear() : '';
                const endYear = option.endDate ? new Date(option.endDate).getFullYear() : '';
                return option?.name ? `${option.name} (${startYear} - ${endYear})` : '';
              }}
            onChange={handlePeriodChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            // value={periods.find(period => period._id === document.period?._id) || null}
            value={document.period || {}}
            renderInput={(params) => <TextField {...params} label="Dönem Seç" variant="outlined" />}
            fullWidth
          />
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

export default PeriodDocumentForm;
