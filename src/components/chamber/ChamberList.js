// components/chamber/ChamberList.js
import React, { useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TableContainer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { getChambers, deleteChamber } from '../../api';

const ChamberList = ({ onEdit, onNotify }) => {
  const { t } = useTranslation();
  const [chambers, setChambers] = useState([]);

  const fetchChambers = async () => {
    try {
      const result = await getChambers();
      setChambers(result.data);
    } catch (error) {
      onNotify(t('errorLoadingChambers'), 'error');
    }
  };

  useEffect(() => {
    fetchChambers();
  }, [onNotify]);

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeleteChamber'))) {
      try {
        await deleteChamber(id);
        onNotify(t('chamberDeleted'));
        fetchChambers();
      } catch (error) {
        onNotify(t('errorDeletingChamber'), 'error');
      }
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Logo')}</TableCell>
              <TableCell>{t('Name')}</TableCell>
              <TableCell>{t('Website')}</TableCell>
              <TableCell>{t('Contact')}</TableCell>
              <TableCell>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chambers.map(chamber => (
              <TableRow key={chamber._id}>
                <TableCell>
                  {/* Logo gösterimi: örneğin küçük resim */}
                  <img src={chamber.logo.url} alt={chamber.name} style={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell>{chamber.name}</TableCell>
                <TableCell>{chamber.website}</TableCell>
                <TableCell>
                  {chamber.contact.address} <br/>
                  {chamber.contact.phone} <br/>
                  {chamber.contact.email}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(chamber)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(chamber._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ChamberList;