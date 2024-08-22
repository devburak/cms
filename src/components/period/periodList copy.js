import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const PeriodList = ({ periods = [], onEdit, onDelete }) => {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dönem Adı</TableCell>
              <TableCell>Başlangıç Tarihi</TableCell>
              <TableCell>Bitiş Tarihi</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={period._id}>
                <TableCell>{period.name}</TableCell>
                <TableCell>{moment(period.startDate).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{period.endDate ? moment(period.endDate).format('DD/MM/YYYY') : '-'}</TableCell>
                <TableCell>{period.description ? `${period.description.substring(0, 30)}...` : ''}</TableCell>
                <TableCell>
                  <Tooltip title="Düzenle">
                    <IconButton onClick={() => onEdit(period)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton onClick={() => onDelete(period._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PeriodList;
