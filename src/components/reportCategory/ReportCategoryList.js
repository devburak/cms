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

export default function ReportCategoryList({
  categories = [],
  onEdit,
  onDelete,
  canDelete = false,
}) {
  const handleDelete = (category) => {
    if (!canDelete || !onDelete || Number(category?.reportCount || 0) > 0) {
      return;
    }

    const confirmed = window.confirm(`"${category.name}" rapor kategorisini silmek istiyor musunuz?`);
    if (confirmed) {
      onDelete(category._id);
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kategori</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Rapor Sayisi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Islemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              const hasReports = Number(category?.reportCount || 0) > 0;
              const deleteDisabled = !canDelete || hasReports;
              const deleteTooltip = hasReports
                ? `Bu kategoriye bagli ${category.reportCount} rapor oldugu icin silinemez`
                : 'Sil';

              return (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.reportCount || 0}</TableCell>
                  <TableCell>{category.isListed ? 'Listede' : 'Gizli'}</TableCell>
                  <TableCell>
                    <Tooltip title="Duzenle">
                      <IconButton onClick={() => onEdit(category)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={deleteTooltip}>
                      <span>
                        <IconButton disabled={deleteDisabled} onClick={() => handleDelete(category)}>
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
