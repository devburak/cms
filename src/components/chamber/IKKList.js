import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { getAllIKKs, deleteIKK } from '../../api';

const IKKList = ({ onEdit, refreshTrigger, onNotify, onRefresh }) => {
  const { t } = useTranslation();
  const [ikks, setIkks] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIKKId, setSelectedIKKId] = useState(null);

  const fetchIkks = async () => {
    try {
      const data = await getAllIKKs();
      setIkks(data);
    } catch (error) {
      if (onNotify) onNotify(t('Error fetching IKKs'), 'error');
    }
  };

  useEffect(() => {
    fetchIkks();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchIkks();
    }
  }, [refreshTrigger]);

  const handleDeleteClick = (id) => {
    setSelectedIKKId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteIKK(selectedIKKId);
      if (onNotify) onNotify(t('IKK deleted!'), 'success');
      setDeleteDialogOpen(false);
      setSelectedIKKId(null);
      fetchIkks();
      if (onRefresh) onRefresh();
    } catch (error) {
      if (onNotify) onNotify(t('Error deleting IKK!'), 'error');
      setDeleteDialogOpen(false);
      setSelectedIKKId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedIKKId(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" fontSize="0.95rem">{t('IKK List')}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Title')}</TableCell>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Secretaries')}</TableCell>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Address')}</TableCell>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Phone')}</TableCell>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Email')}</TableCell>
            <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{t('Actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ikks && ikks.map((ikk) => (
            <TableRow key={ikk._id}>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{ikk.title}</TableCell>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>
                {ikk.secretaries && ikk.secretaries.map((sec, i) => (
                  <div key={i}>{sec.name} ({sec.chamber?.name})</div>
                ))}
              </TableCell>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{ikk.address}</TableCell>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{ikk.contact?.phone}</TableCell>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>{ikk.contact?.email}</TableCell>
              <TableCell sx={{ py: 0.5, px: 1, lineHeight: 1.2 }}>
                <IconButton onClick={() => onEdit(ikk)} color="primary" size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteClick(ikk._id)} color="secondary" size="small">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{t('Confirm Delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('Are you sure you want to delete this IKK?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('Cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default IKKList;