import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControlLabel, Checkbox, IconButton, Typography, Paper, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { createForm, updateForm, getFormById } from '../../api';

const emptyField = {
  name: '',
  label: '',
  type: 'text',
  required: false,
  options: [],
  minLength: '',
  maxLength: '',
  minValue: '',
  maxValue: '',
  minChoices: 0,
  maxChoices: '',
  regex: ''
};

const fieldTypes = ['text','number','select','multiselect','radio','date','datetime','html'];

function FieldEditor({ field, onChange, onDelete }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ ...field, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <Paper sx={{ p:2, mb:2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={11}>
          <TextField label="Field Name" name="name" value={field.name} onChange={handleChange} fullWidth sx={{ mb:1 }} />
          <TextField label="Label" name="label" value={field.label} onChange={handleChange} fullWidth sx={{ mb:1 }} />
          <Select name="type" value={field.type} onChange={handleChange} fullWidth sx={{ mb:1 }}>
            {fieldTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
          {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
            <TextField label="Options (comma separated)" name="options" value={field.options.join(',')} onChange={e => onChange({ ...field, options:e.target.value.split(',') })} fullWidth sx={{ mb:1 }} />
          )}
          <TextField label="Regex" name="regex" value={field.regex||''} onChange={handleChange} fullWidth sx={{ mb:1 }} />
          <FormControlLabel control={<Checkbox checked={field.required} onChange={handleChange} name="required"/>} label="Required" />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function FormBuilder({ formId, onSaved }) {
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if(formId) {
      getFormById(formId).then(data => {
        setName(data.name);
        setFields(data.fields || []);
      });
    }
  }, [formId]);

  const addField = () => setFields([...fields, { ...emptyField, name:`field${fields.length+1}` }]);
  const updateField = (index, field) => {
    const updated = [...fields];
    updated[index] = field;
    setFields(updated);
  };
  const deleteField = (index) => setFields(fields.filter((_,i)=>i!==index));

  const handleSave = async () => {
    const form = { name, fields };
    if(formId) await updateForm(formId, form); else await createForm(form);
    if(onSaved) onSaved();
  };

  // simple drag and drop handlers
  const onDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };
  const onDrop = (e, index) => {
    const from = e.dataTransfer.getData('text/plain');
    if(from === '') return;
    const updated = [...fields];
    const moved = updated.splice(from,1)[0];
    updated.splice(index,0,moved);
    setFields(updated);
  };
  const onDragOver = (e) => e.preventDefault();

  return (
    <Box>
      <TextField label="Form Name" value={name} onChange={e=>setName(e.target.value)} fullWidth sx={{ mb:2 }} />
      {fields.map((f,idx) => (
        <div key={idx} draggable onDragStart={(e)=>onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, idx)}>
          <FieldEditor field={f} onChange={fld=>updateField(idx,fld)} onDelete={()=>deleteField(idx)} />
        </div>
      ))}
      <Button onClick={addField}>Add Field</Button>
      <Button variant="contained" onClick={handleSave} sx={{ ml:2 }}>Save Form</Button>
    </Box>
  );
}
