import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
} from '@mui/material';
import { getForms, getSubmissions, exportSubmissionsFile } from '../../api';
import { saveAs } from 'file-saver';
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
  const [exporting, setExporting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

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

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(true);
    setDownloadProgress(0);
    try {
      const blob = await exportSubmissionsFile(
        selectedForm,
        format,
        (e) => {
          if (e.total) {
            setDownloadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      );
      saveAs(blob, `submissions.${format === 'xlsx' ? 'xlsx' : 'csv'}`);
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setExporting(false);
    }
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
              <Button onClick={() => handleExport('csv')} fullWidth variant="outlined" disabled={exporting}>Export CSV</Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button onClick={() => handleExport('xlsx')} fullWidth variant="outlined" disabled={exporting}>Export XLSX</Button>
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
      <Dialog open={exporting}>
        <DialogTitle>Exporting...</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 200 }}>
            <LinearProgress
              variant={downloadProgress ? 'determinate' : 'indeterminate'}
              value={downloadProgress}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
