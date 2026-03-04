import React from 'react';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function WorkGroupList({
  workGroups = [],
  onEdit,
  onDelete,
  canDelete = false,
}) {
  const handleDelete = (item) => {
    if (
      !canDelete ||
      !onDelete ||
      Number(item?.reportCount || 0) > 0 ||
      Number(item?.decisionCount || 0) > 0
    ) {
      return;
    }

    const confirmed = window.confirm(`"${item.name}" çalışma grubunu silmek istiyor musunuz?`);
    if (confirmed) {
      onDelete(item._id);
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Çalışma Grubu</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Dönem</TableCell>
              <TableCell>Üye</TableCell>
              <TableCell>Rapor</TableCell>
              <TableCell>Karar</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workGroups.map((item) => {
              const linkedCount = Number(item?.reportCount || 0) + Number(item?.decisionCount || 0);
              const deleteDisabled = !canDelete || linkedCount > 0;
              const deleteTooltip = linkedCount > 0
                ? 'Bağlı rapor/karar olduğu için silinemez'
                : 'Sil';

              return (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>{item.period?.name || '-'}</TableCell>
                  <TableCell>{item.memberCount || 0}</TableCell>
                  <TableCell>{item.reportCount || 0}</TableCell>
                  <TableCell>{item.decisionCount || 0}</TableCell>
                  <TableCell>{item.isListed ? 'Listede' : 'Gizli'}</TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton onClick={() => onEdit(item)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={deleteTooltip}>
                      <span>
                        <IconButton disabled={deleteDisabled} onClick={() => handleDelete(item)}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
