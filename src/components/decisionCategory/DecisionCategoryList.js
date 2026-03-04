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

export default function DecisionCategoryList({
  categories = [],
  onEdit,
  onDelete,
  canDelete = false,
}) {
  const handleDelete = (category) => {
    if (!canDelete || !onDelete || Number(category?.decisionCount || 0) > 0) {
      return;
    }

    const confirmed = window.confirm(`"${category.name}" karar kategorisini silmek istiyor musunuz?`);
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
              <TableCell>Karar Sayısı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              const hasDecisions = Number(category?.decisionCount || 0) > 0;
              const deleteDisabled = !canDelete || hasDecisions;
              const deleteTooltip = hasDecisions
                ? `Bu kategoriye bağlı ${category.decisionCount} karar olduğu için silinemez`
                : 'Sil';

              return (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.decisionCount || 0}</TableCell>
                  <TableCell>{category.isListed ? 'Listede' : 'Gizli'}</TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
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
