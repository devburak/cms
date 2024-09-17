import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getPeriodDocuments, deletePeriodDocument } from '../../api';
import { useNavigate } from 'react-router-dom';

const PeriodDocumentList = () => {
  const [periodDocuments, setPeriodDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPeriodDocuments();
  }, []);

  const fetchPeriodDocuments = async () => {
    try {
      const data = await getPeriodDocuments();
      setPeriodDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching period documents:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePeriodDocument(id);
      fetchPeriodDocuments(); // Yeniden yükle
    } catch (error) {
      console.error('Error deleting period document:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/period-documents/edit/${id}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Başlık</TableCell>
            <TableCell>Dönem</TableCell>
            <TableCell>Oluşturan</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {periodDocuments.map((doc) => (
            <TableRow key={doc._id}>
              <TableCell>{doc.title}</TableCell>
              <TableCell>{doc.period?.name || 'Belirtilmemiş'}</TableCell>
              <TableCell>{doc.createdBy?.name || 'Bilinmiyor'}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(doc._id)}>Düzenle</Button>
                <Button color="secondary" onClick={() => handleDelete(doc._id)}>Sil</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PeriodDocumentList;
