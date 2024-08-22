import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllContents, deleteContent } from '../../api'; // API fonksiyonlarını içe aktarın
import { useNavigate } from 'react-router-dom';
const ContentList = () => {
  const [contents, setContents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    fetchContents();
  }, [page, rowsPerPage]);

  const fetchContents = async () => {
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      const data = await getAllContents(params);
      setContents(data.contents);
      setTotalCount(data.totalDocuments);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (content) => {
    console.log('Edit content:', content);
    // Düzenleme işlemi burada yapılabilir
    navigate(`/content/${content._id}`);
  };

  const handleDelete = async (content) => {
    try {
      await deleteContent(content._id);
      fetchContents(); // İçerik silindikten sonra verileri yeniden yükleyin
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Yayın Tarihi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Güncelleme</TableCell>
              <TableCell>Actions</TableCell> {/* Action sütunu */}
            </TableRow>
          </TableHead>
          <TableBody>
            {contents.map((content) => (
              <TableRow key={content._id}>
                <TableCell>{content.title}</TableCell>
                <TableCell>{content.categories.map(cat => cat.name).join(', ')}</TableCell>
                <TableCell>{content.author ? content.author.name : ''}</TableCell>
                <TableCell>{new Date(content.publishDate).toLocaleString()}</TableCell>
                <TableCell>{content.status}</TableCell>
                <TableCell>{new Date(content.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(content)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(content)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
};

export default ContentList;
