import React, { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr';
import slugify from 'slugify';
import EditorWrapper from '../lexical/playground';
import FeaturedImageUpload from '../file/featuredImage';
import {
  createDecision,
  getAllPeriods,
  getDecisionCategories,
  getWorkGroups,
  updateDecision,
} from '../../api';

const DECISION_TYPES = [
  { value: 'management-board', label: 'Yönetim Kurulu Kararı' },
  { value: 'audit-board', label: 'Denetleme Kurulu Kararı' },
  { value: 'honor-board', label: 'Onur Kurulu Kararı' },
  { value: 'work-group', label: 'Çalışma Grubu Kararı' },
];

const createAttendee = () => ({
  firstName: '',
  lastName: '',
  unit: '',
  chamber: '',
});

const createInitialFormData = () => ({
  title: '',
  slug: '',
  spot: '',
  bodyHtml: '',
  bodyJson: '',
  featuredMedia: null,
  decisionCategory: null,
  decisionType: 'management-board',
  period: null,
  workGroup: null,
  meetingNo: '',
  meetingDate: moment(),
  meetingTime: '',
  meetingLocation: '',
  attendees: [createAttendee()],
  publishDate: moment(),
});

export default function DecisionForm({ decision, onSuccess, onError }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const [periods, setPeriods] = useState([]);
  const [decisionCategories, setDecisionCategories] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [initialContent, setInitialContent] = useState('');
  const [currentContent, setCurrentContent] = useState({ json: '', html: '' });
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [periodsData, categoriesData, workGroupsData] = await Promise.all([
          getAllPeriods(),
          getDecisionCategories(),
          getWorkGroups(),
        ]);

        setPeriods(periodsData.periods || []);
        setDecisionCategories(categoriesData || []);
        setWorkGroups(workGroupsData || []);
      } catch (error) {
        console.error('Error fetching decision dependencies:', error);
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (!decision) {
      setFormData(createInitialFormData());
      setInitialContent('');
      setCurrentContent({ json: '', html: '' });
      setEditorResetKey((prev) => prev + 1);
      return;
    }

    const nextInitialContent = decision.bodyJson || decision.bodyHtml || '';

    setFormData({
      ...createInitialFormData(),
      ...decision,
      decisionCategory: decision.decisionCategory || null,
      period: decision.period || null,
      workGroup: decision.workGroup || null,
      featuredMedia: decision.featuredMedia || null,
      attendees:
        Array.isArray(decision.attendees) && decision.attendees.length > 0
          ? decision.attendees
          : [createAttendee()],
      meetingDate: decision.meetingDate ? moment(decision.meetingDate) : moment(),
      publishDate: decision.publishDate ? moment(decision.publishDate) : moment(),
    });
    setInitialContent(nextInitialContent);
    setCurrentContent({
      json: decision.bodyJson || '',
      html: decision.bodyHtml || '',
    });
    setEditorResetKey((prev) => prev + 1);
  }, [decision]);

  const selectedCategory = useMemo(() => {
    if (!formData.decisionCategory) {
      return null;
    }
    const categoryId = formData.decisionCategory._id || formData.decisionCategory;
    return (
      decisionCategories.find((item) => item._id === categoryId) ||
      formData.decisionCategory
    );
  }, [decisionCategories, formData.decisionCategory]);

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

  const handleAttendeeChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.map((attendee, attendeeIndex) =>
        attendeeIndex === index ? { ...attendee, [field]: value } : attendee
      ),
    }));
  };

  const addAttendee = () => {
    setFormData((prev) => ({
      ...prev,
      attendees: [...prev.attendees, createAttendee()],
    }));
  };

  const removeAttendee = (index) => {
    setFormData((prev) => {
      const nextAttendees = prev.attendees.filter((_, attendeeIndex) => attendeeIndex !== index);
      return {
        ...prev,
        attendees: nextAttendees.length > 0 ? nextAttendees : [createAttendee()],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        bodyJson: currentContent.json || '',
        bodyHtml: currentContent.html || '',
        decisionCategory: selectedCategory?._id || null,
        period: selectedPeriod?._id || null,
        workGroup: selectedWorkGroup?._id || null,
        meetingDate: formData.meetingDate?.toISOString?.() || null,
        publishDate: formData.publishDate?.toISOString?.() || new Date().toISOString(),
        attendees: formData.attendees.filter((item) => item.firstName && item.lastName),
      };

      if (decision?._id) {
        await updateDecision(decision._id, payload);
        onSuccess('Karar güncellendi');
      } else {
        await createDecision(payload);
        onSuccess('Karar oluşturuldu');
      }

      setFormData(createInitialFormData());
      setInitialContent('');
      setCurrentContent({ json: '', html: '' });
      setEditorResetKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      onError('Karar kaydedilirken hata oluştu');
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
                  label="Karar Başlığı"
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
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Karar Tipi"
                  value={formData.decisionType}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, decisionType: event.target.value }))
                  }
                >
                  {DECISION_TYPES.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={decisionCategories}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  value={selectedCategory}
                  onChange={(event, newValue) =>
                    setFormData((prev) => ({ ...prev, decisionCategory: newValue || null }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Karar Kategorisi" size="small" required />
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
                    <TextField {...params} label="Dönem" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
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

          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Toplantı No"
              value={formData.meetingNo}
              onChange={(event) => setFormData((prev) => ({ ...prev, meetingNo: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Toplantı Saati"
              placeholder="14:30"
              value={formData.meetingTime}
              onChange={(event) => setFormData((prev) => ({ ...prev, meetingTime: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
              <DateTimePicker
                label="Toplantı Tarihi"
                value={formData.meetingDate}
                onChange={(value) => setFormData((prev) => ({ ...prev, meetingDate: value || null }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
              <DateTimePicker
                label="Yayın Tarihi"
                value={formData.publishDate}
                onChange={(value) => setFormData((prev) => ({ ...prev, publishDate: value || null }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              label="Toplantı Yeri"
              value={formData.meetingLocation}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, meetingLocation: event.target.value }))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Katılım Listesi</Typography>
          </Grid>

          {formData.attendees.map((attendee, index) => (
            <Grid item xs={12} key={`attendee-${index}`}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <TextField
                      required
                      size="small"
                      fullWidth
                      label="Ad"
                      value={attendee.firstName}
                      onChange={(event) => handleAttendeeChange(index, 'firstName', event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      required
                      size="small"
                      fullWidth
                      label="Soyad"
                      value={attendee.lastName}
                      onChange={(event) => handleAttendeeChange(index, 'lastName', event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Birimi"
                      value={attendee.unit}
                      onChange={(event) => handleAttendeeChange(index, 'unit', event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Odası"
                      value={attendee.chamber}
                      onChange={(event) => handleAttendeeChange(index, 'chamber', event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton onClick={() => removeAttendee(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addAttendee}>
              Katılımcı Ekle
            </Button>
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
              {decision?._id ? 'Kararı Güncelle' : 'Karar Oluştur'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
