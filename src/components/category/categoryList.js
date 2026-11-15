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
  total = 0,
  scope = 'content'
}) => {

  const handleDelete = (category) => {
    if (!canDelete || !onDelete || category.canDelete === false || Number(category?.usageCount || category?.contentCount || 0) > 0) return;
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
              <TableCell>Başlık</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Kullanım</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0 ? categories.slice(page * rowsPerPage, (page + 1) * rowsPerPage) : categories).map((category) => {
              const hasLinkedContent = category.canDelete === false || Number(category?.usageCount || category?.contentCount || 0) > 0;
              const deleteDisabled = !canDelete || hasLinkedContent;
              const deleteTooltip = hasLinkedContent
                ? 'Bağlı kayıtlar bulunduğu için kaldırılamaz.'
                : 'Kaldır';

              return (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{scope === 'publication' ? `${category.publicationCount || 0} yayın` : `${category.contentCount || 0} içerik`}
                    {category.childCount > 0 && ` · ${category.childCount} alt kategori`}
                    {category.versionCount > 0 && ` · ${category.versionCount} geçmiş sürüm`}
                  </TableCell>
                  <TableCell>{category.description ? `${category.description.substring(0, 30)}...` : ''}</TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton disabled={!onEdit} aria-label={`${category.name} düzenle`} onClick={() => onEdit?.(category)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={deleteTooltip} aria-label="delete">
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
     { rowsPerPage > 0 ?  <TablePagination
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
