import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Pagination, Button, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getForms, deleteForm } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => { fetchForms(); }, [page, search]);

  const fetchForms = async () => {
    const data = await getForms({ search, page, limit });
    setForms(data.forms || []);
    setTotalPages(Math.ceil((data.total || 0) / limit));
  };

  const handleDelete = async (id, submissions) => {
    if(submissions>0) return;
    await deleteForm(id);
    fetchForms();
  };

  return (
    <TableContainer>
      <Grid container spacing={2} alignItems="center" sx={{ my:2 }}>
        <Grid item xs={12} sm={6}>
          <TextField placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} size="small" fullWidth />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" fullWidth onClick={()=>navigate('/form')}>New Form</Button>
        </Grid>
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Submissions</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map(form => (
            <TableRow key={form._id}>
              <TableCell>{form.name}</TableCell>
              <TableCell>{new Date(form.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" onClick={()=>navigate(`/submissions?formId=${form._id}`)}>
                  {form.submissionCount || 0}
                </Button>
              </TableCell>
              <TableCell>
                <IconButton onClick={()=>navigate(`/form/${form._id}`)}><EditIcon/></IconButton>
                <IconButton onClick={()=>handleDelete(form._id, form.submissionCount)} disabled={form.submissionCount>0}><DeleteIcon/></IconButton>
                <Button size="small" onClick={()=>navigate(`/form/${form._id}/fill`)}>Test</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination count={totalPages} page={page} onChange={(e,v)=>setPage(v)} sx={{my:2}} />
    </TableContainer>
  );
}
