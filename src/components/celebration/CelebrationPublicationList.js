import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CelebrationPublicationList = ({ publications, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Başlık</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Dönem</TableCell>
            <TableCell>Yayınlanma Tarihi</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {publications.map((publication) => (
            <TableRow key={publication._id}>
              <TableCell>{publication.title}</TableCell>
              <TableCell>{publication.url}</TableCell>
              <TableCell>{publication.period?.name || 'Dönem Bilinmiyor'}</TableCell>
              <TableCell>{new Date(publication.publishDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(publication._id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(publication._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CelebrationPublicationList;
