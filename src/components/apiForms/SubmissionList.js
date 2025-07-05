import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Select, MenuItem, Button, Box, Grid } from '@mui/material';
import { getForms, getSubmissions } from '../../api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'react-router-dom';

export default function SubmissionList() {
  const [searchParams] = useSearchParams();
  const initialFormId = searchParams.get('formId') || '';
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(initialFormId);
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => { fetchForms(); }, []);

  useEffect(() => {
    const param = searchParams.get('formId');
    if (param) setSelectedForm(param);
  }, [searchParams]);

  useEffect(() => { if(selectedForm) fetchSubmissions(); }, [selectedForm, page]);

  const fetchForms = async () => {
    const data = await getForms({ page:1, limit:1000 });
    setForms(data.forms || []);
  };

  const fetchSubmissions = async () => {
    const data = await getSubmissions(selectedForm, { page, limit });
    setSubmissions(data.submissions || []);
    setTotalPages(Math.ceil((data.total || 0) / limit));
  };

  const hiddenFields = ['createdBy', '__v', '_id', 'form'];

  const getHeaders = () =>
    submissions.length > 0
      ? Object.keys(submissions[0]).filter((h) => !hiddenFields.includes(h))
      : [];

  const handleExportCSV = () => {
    if(submissions.length===0) return;
    const headers = getHeaders();
    const rows = submissions.map(s => headers.map(h => JSON.stringify(s[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'submissions.csv');
  };

  const handleExportXLSX = () => {
    if(submissions.length===0) return;
    const ws = XLSX.utils.json_to_sheet(submissions.map(s => {
      const copy = {};
      getHeaders().forEach(h => { copy[h] = s[h]; });
      return copy;
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    const xlsBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'submissions.xlsx');
  };

  const renderCell = (key, value) => {
    if(key === 'data' && typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).slice(0,3).map(([k,v])=>`${k}: ${v}`);
      const suffix = Object.keys(value).length > 3 ? ', ...' : '';
      return entries.join(', ') + suffix;
    }
    if(Array.isArray(value)) return value.join(', ');
    if(typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb:2 }} alignItems="center">
        <Grid item xs={12} md={6}>
          <Select
            size="small"
            fullWidth
            value={selectedForm}
            onChange={(e)=>{setSelectedForm(e.target.value); setPage(1);}}
            displayEmpty
          >
            <MenuItem value="">Select Form</MenuItem>
            {forms.map(f=>(<MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>))}
          </Select>
        </Grid>
        {selectedForm && (
          <>
            <Grid item xs={6} md={3}>
              <Button onClick={handleExportCSV} fullWidth variant="outlined">Export CSV</Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button onClick={handleExportXLSX} fullWidth variant="outlined">Export XLSX</Button>
            </Grid>
          </>
        )}
      </Grid>
      {selectedForm && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                {getHeaders().map(key => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub,idx)=>(
                  <TableRow key={sub._id || idx}>
                    {getHeaders().map(k=> (
                      <TableCell key={k}>{renderCell(k, sub[k])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination count={totalPages} page={page} onChange={(e,v)=>setPage(v)} sx={{ mt:2 }} />
        </>
      )}
    </Box>
  );
}
