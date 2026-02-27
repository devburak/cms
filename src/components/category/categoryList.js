import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CategoryList = ({
  categories = [],
  onEdit,
  onDelete,
  canDelete = false,
  page = 0,
  rowsPerPage = 0,
  handleChangePage,
  handleChangeRowsPerPage,
  total = 0
}) => {

  const handleDelete = (category) => {
    if (!canDelete || !onDelete) return;
    const confirmed = window.confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`);
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
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description ? `${category.description.substring(0, 30)}...` : ''}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => onEdit(category)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" aria-label="delete">
                    <span>
                      <IconButton disabled={!canDelete} onClick={() => handleDelete(category)}>
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
     { rowsPerPage === 0 ?  <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> :null}
    </Paper>
  );
};

export default CategoryList;
