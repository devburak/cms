import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Select, MenuItem, Button, Box } from '@mui/material';
import { getForms, getSubmissions } from '../../api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function SubmissionList() {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => { fetchForms(); }, []);

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

  const handleExportCSV = () => {
    if(submissions.length===0) return;
    const headers = Object.keys(submissions[0]);
    const rows = submissions.map(s => headers.map(h => JSON.stringify(s[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'submissions.csv');
  };

  const handleExportXLSX = () => {
    if(submissions.length===0) return;
    const ws = XLSX.utils.json_to_sheet(submissions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    const xlsBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'submissions.xlsx');
  };

  const renderCell = (value) => {
    if(Array.isArray(value)) return value.join(', ');
    if(typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  return (
    <Box>
      <Select
        value={selectedForm}
        onChange={(e)=>{setSelectedForm(e.target.value); setPage(1);}}
        displayEmpty
        sx={{ mb:2, minWidth:200 }}
      >
        <MenuItem value="">Select Form</MenuItem>
        {forms.map(f=>(<MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>))}
      </Select>
      {selectedForm && (
        <>
          <Box sx={{ mb:2 }}>
            <Button onClick={handleExportCSV} sx={{mr:1}} variant="outlined">Export CSV</Button>
            <Button onClick={handleExportXLSX} variant="outlined">Export XLSX</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {submissions.length>0 && Object.keys(submissions[0]).map(key=> (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub,idx)=>(
                  <TableRow key={sub._id || idx}>
                    {Object.keys(submissions[0]||{}).map(k=> (
                      <TableCell key={k}>{renderCell(sub[k])}</TableCell>
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
