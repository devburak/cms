import React, { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr';
import slugify from 'slugify';
import EditorWrapper from '../lexical/playground';
import FeaturedImageUpload from '../file/featuredImage';
import {
  createReport,
  getAllPeriods,
  getReportCategories,
  getWorkGroups,
  updateReport,
} from '../../api';

const createInitialFormData = () => ({
  title: '',
  slug: '',
  spot: '',
  bodyHtml: '',
  bodyJson: '',
  featuredMedia: null,
  reportCategory: null,
  period: null,
  workGroup: null,
  meetingNo: '',
  meetingDate: moment(),
  meetingLocation: '',
  publishDate: moment(),
});

export default function ReportForm({ report, onSuccess, onError }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [periods, setPeriods] = useState([]);
  const [reportCategories, setReportCategories] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [initialContent, setInitialContent] = useState('');
  const [currentContent, setCurrentContent] = useState({ json: '', html: '' });
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [periodsData, reportCategoriesData, workGroupsData] = await Promise.all([
          getAllPeriods(),
          getReportCategories(),
          getWorkGroups(),
        ]);

        setPeriods(periodsData.periods || []);
        setReportCategories(reportCategoriesData || []);
        setWorkGroups(workGroupsData || []);
      } catch (error) {
        console.error('Error fetching report dependencies:', error);
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (!report) {
      setFormData(createInitialFormData());
      setInitialContent('');
      setCurrentContent({ json: '', html: '' });
      setEditorResetKey((prev) => prev + 1);
      return;
    }

    const nextInitialContent = report.bodyJson || report.bodyHtml || '';

    setFormData({
      ...createInitialFormData(),
      ...report,
      reportCategory: report.reportCategory || null,
      period: report.period || null,
      workGroup: report.workGroup || null,
      featuredMedia: report.featuredMedia || null,
      meetingDate: report.meetingDate ? moment(report.meetingDate) : moment(),
      publishDate: report.publishDate ? moment(report.publishDate) : moment(),
    });
    setInitialContent(nextInitialContent);
    setCurrentContent({
      json: report.bodyJson || '',
      html: report.bodyHtml || '',
    });
    setEditorResetKey((prev) => prev + 1);
  }, [report]);

  const selectedCategory = useMemo(() => {
    if (!formData.reportCategory) {
      return null;
    }

    const categoryId = formData.reportCategory._id || formData.reportCategory;
    return reportCategories.find((item) => item._id === categoryId) || formData.reportCategory;
  }, [formData.reportCategory, reportCategories]);

  const selectedPeriod = useMemo(() => {
    if (!formData.period) {
      return null;
    }

    const periodId = formData.period._id || formData.period;
    return periods.find((item) => item._id === periodId) || formData.period;
  }, [formData.period, periods]);

  const selectedWorkGroup = useMemo(() => {
    if (!formData.workGroup) {
      return null;
    }

    const workGroupId = formData.workGroup._id || formData.workGroup;
    return workGroups.find((item) => item._id === workGroupId) || formData.workGroup;
  }, [formData.workGroup, workGroups]);

  const handleTitleChange = (event) => {
    const title = event.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: slugify(title, { lower: true, strict: true }).replace(/\./g, '-'),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        bodyJson: currentContent.json || '',
        bodyHtml: currentContent.html || '',
        reportCategory: selectedCategory?._id || null,
        period: selectedPeriod?._id || null,
        workGroup: selectedWorkGroup?._id || null,
        meetingDate: formData.meetingDate?.toISOString?.() || null,
        publishDate: formData.publishDate?.toISOString?.() || new Date().toISOString(),
      };

      if (report?._id) {
        await updateReport(report._id, payload);
        onSuccess('Rapor guncellendi');
      } else {
        await createReport(payload);
        onSuccess('Rapor olusturuldu');
      }

      setFormData(createInitialFormData());
      setInitialContent('');
      setCurrentContent({ json: '', html: '' });
      setEditorResetKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      onError('Rapor kaydedilirken hata olustu');
    }

    setIsSubmitting(false);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FeaturedImageUpload
              handleFeaturedImage={(file) => setFormData((prev) => ({ ...prev, featuredMedia: file }))}
              initialFile={formData.featuredMedia}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  size="small"
                  fullWidth
                  label="Rapor Basligi"
                  value={formData.title}
                  onChange={handleTitleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  size="small"
                  fullWidth
                  label="Slug"
                  value={formData.slug}
                  onChange={(event) => setFormData((prev) => ({ ...prev, slug: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={reportCategories}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  value={selectedCategory}
                  onChange={(event, newValue) =>
                    setFormData((prev) => ({ ...prev, reportCategory: newValue || null }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Rapor Kategorisi" size="small" required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={periods}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  value={selectedPeriod}
                  onChange={(event, newValue) =>
                    setFormData((prev) => ({ ...prev, period: newValue || null }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Donem" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={workGroups}
                  getOptionLabel={(option) =>
                    `${option.name || ''}${option.period?.name ? ` (${option.period.name})` : ''}`
                  }
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  value={selectedWorkGroup}
                  onChange={(event, newValue) =>
                    setFormData((prev) => ({ ...prev, workGroup: newValue || null }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Çalışma Grubu (Opsiyonel)" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Toplanti No"
                  value={formData.meetingNo}
                  onChange={(event) => setFormData((prev) => ({ ...prev, meetingNo: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  label="Spot"
                  value={formData.spot}
                  onChange={(event) => setFormData((prev) => ({ ...prev, spot: event.target.value }))}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
              <DateTimePicker
                label="Toplanti Tarihi"
                value={formData.meetingDate}
                onChange={(value) => setFormData((prev) => ({ ...prev, meetingDate: value || null }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              label="Toplanti Yeri"
              value={formData.meetingLocation}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, meetingLocation: event.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
              <DateTimePicker
                label="Yayin Tarihi"
                value={formData.publishDate}
                onChange={(value) => setFormData((prev) => ({ ...prev, publishDate: value || null }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <EditorWrapper
              key={editorResetKey}
              initialContent={initialContent}
              getContent={setCurrentContent}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {report?._id ? 'Raporu Guncelle' : 'Rapor Olustur'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
