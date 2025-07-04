import React, { useEffect, useState } from 'react';
import { Box, TextField, Checkbox, FormControlLabel, Select, MenuItem, Button } from '@mui/material';
import { getFormById, createSubmission } from '../../api';
import { useParams } from 'react-router-dom';

function renderField(field, value, setValue) {
  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValue(val);
  };

  switch(field.type) {
    case 'text':
      return <TextField label={field.label} value={value||''} onChange={handleChange} fullWidth sx={{mb:2}} />;
    case 'number':
      return <TextField type="number" label={field.label} value={value||''} onChange={handleChange} fullWidth sx={{mb:2}} />;
    case 'select':
      return (
        <Select value={value||''} onChange={handleChange} fullWidth sx={{mb:2}}>
          {field.options.map(opt=> <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      );
    case 'multiselect':
      return (
        <Select multiple value={value||[]} onChange={handleChange} fullWidth sx={{mb:2}}>
          {field.options.map(opt=> <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      );
    case 'radio':
      return (
        <Box sx={{mb:2}}>
          {field.options.map(opt => (
            <FormControlLabel key={opt} control={<Checkbox checked={value===opt} onChange={()=>setValue(opt)} />} label={opt} />
          ))}
        </Box>
      );
    case 'date':
    case 'datetime':
      return <TextField type="date" label={field.label} value={value||''} onChange={handleChange} fullWidth sx={{mb:2}} />;
    case 'html':
      return <TextField multiline label={field.label} value={value||''} onChange={handleChange} fullWidth sx={{mb:2}} />;
    default:
      return null;
  }
}

export default function FormFill() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    getFormById(id).then(data => setForm(data));
  }, [id]);

  const handleSubmit = async () => {
    await createSubmission(id, values);
    alert('Submitted');
  };

  if(!form) return null;

  return (
    <Box>
      <h2>{form.name}</h2>
      {form.fields.map(f => {
        const value = values[f.name];
        return (
          <div key={f.name}>
            {renderField(f, value, val=>setValues({...values, [f.name]:val}))}
          </div>
        );
      })}
      <Button variant="contained" onClick={handleSubmit}>Submit</Button>
    </Box>
  );
}
