import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/tr';
import { getEventById, createEvent, updateEvent, getAllEventTypes, createEventType } from '../../api';
import EditorWrapper from '../lexical/playground';
import { $generateNodesFromDOM } from "@lexical/html";
import { createEditor } from "lexical";

const EventForm = ({ eventId, onSave }) => {
  const [event, setEvent] = useState({
    title: '',
    spot: '',
    startDate: null,
    endDate: null,
    location: '',
    eventType: '',
    link: '',
    bodyHtml: '',
    bodyJson: ''
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [newEventType, setNewEventType] = useState('');
  const [initialContent, setInitialContent] = useState('');

  useEffect(() => {
    if (eventId) {
      getEventById(eventId).then((data) => {
        setEvent({
          ...data,
          startDate: data.startDate ? moment(data.startDate) : null,
          endDate: data.endDate ? moment(data.endDate) : null,
          bodyHtml: data.bodyHtml || '',
          bodyJson: data.bodyJson || '',
        });

          // İçeriği işleme: JSON varsa onu kullan, yoksa HTML'den dönüştür
          if (data.bodyJson) {
              setInitialContent(data.bodyJson);
          } else if (data.bodyHtml) {
              const editor = createEditor();
              const parser = new DOMParser();
              const dom = parser.parseFromString(data.bodyHtml, "text/html");
              editor.update(() => {
                  const nodes = $generateNodesFromDOM(editor, dom);
                  const jsonContent = editor.getEditorState().toJSON();
                  setInitialContent(JSON.stringify(jsonContent));
              });
          }
      });
    }
    getAllEventTypes().then(setEventTypes);
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setEvent((prev) => ({
      ...prev,
      [field]: date
    }));
  };

  const handleEventTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setNewEventType('');
      setEvent((prev) => ({
        ...prev,
        eventType: 'new'
      }));
    } else {
      setEvent((prev) => ({
        ...prev,
        eventType: value
      }));
    }
  };

  const handleNewEventTypeChange = (e) => {
    setNewEventType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let eventTypeId = event.eventType;
      if (event.eventType === 'new' && newEventType) {
        const createdType = await createEventType({ name: newEventType });
        eventTypeId = createdType._id;
      }
      const eventData = { ...event, eventType: eventTypeId };
      if (eventId) {
        await updateEvent(eventId, eventData);
      } else {
        await createEvent(eventData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };


  const handleEditorChange = (content) => {
    setEvent((prev) => ({
      ...prev,
      bodyHtml: content.html, // HTML içerik
      bodyJson: content.json, // JSON içerik
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Title"
            value={event.title}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="spot"
            label="Spot"
            value={event.spot}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
            <DateTimePicker
              label="Start Date"
              value={event.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              slots={{ textField: (params) => <TextField {...params} fullWidth required size="small" /> }}
              ampm={false}
              inputFormat="DD/MM/YYYY HH:mm"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="tr">
            <DateTimePicker
              label="End Date"
              value={event.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
              slots={{ textField: (params) => <TextField {...params} fullWidth  size="small" /> }}
              ampm={false}
              inputFormat="DD/MM/YYYY HH:mm"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="location"
            label="Location"
            value={event.location}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Event Type</InputLabel>
            <Select
              name="eventType"
              value={event.eventType === 'new' ? 'new' : event.eventType}
              onChange={handleEventTypeChange}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type._id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
              <MenuItem value="new">+ Yeni Tip oluştur</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {event.eventType === 'new' && (
          <Grid item xs={12}>
            <TextField
              name="newEventType"
              label="Yeni Etkinlik Tipi"
              value={newEventType}
              onChange={handleNewEventTypeChange}
              fullWidth
              size="small"
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <EditorWrapper
            initialContent={initialContent} //
            getContent={handleEditorChange} // İçerik değişimlerini yönet
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            {eventId ? 'Update Event' : 'Create Event'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default EventForm;
