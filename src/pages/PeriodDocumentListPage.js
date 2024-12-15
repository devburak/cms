import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle ,TablePagination} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPeriodDocuments ,deletePeriodDocument } from '../api'; // API fonksiyonunu içe aktar
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const PeriodDocumentListPage = () => {
  const [documents, setDocuments] = useState([]); // Dönem dokümanlarını tutar
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Silme onayı dialogu için durum
  const [selectedDocumentId, setSelectedDocumentId] = useState(null); // Silinecek dokümanın ID'si
  const [page, setPage] = useState(0); // Mevcut sayfa (0-based)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Sayfa başına gösterilecek doküman sayısı
  const [totalDocuments, setTotalDocuments] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments(page + 1, rowsPerPage); // Sayfa değişince veya doküman sayısı değişince veriyi çek
  }, [page, rowsPerPage]);

  /// Dönem dokümanlarını getirir
  const fetchDocuments = async (page, limit) => {
    try {
      const data = await getPeriodDocuments(page, limit);
      setDocuments(Array.isArray(data.periodDocuments) ? data.periodDocuments : []);
      setTotalDocuments(data.totalDocuments || 0); // Total document count for pagination
    } catch (error) {
      console.error('Error fetching period documents:', error);
      setDocuments([]); // Hata durumunda boş dizi olarak ayarla
    }
  };
  // Düzenleme sayfasına yönlendirme
  const handleEdit = (id) => {
    navigate(`/period-document/${id}`);
  };

  // Yeni doküman ekleme sayfasına yönlendirme
  const handleAddNew = () => {
    navigate('/period-document');
  };
// Silme butonuna tıklanınca dialog açılır
const handleDeleteClick = (id) => {
    setSelectedDocumentId(id);
    setOpenDeleteDialog(true);
  };

  // Silme işlemini onaylayınca gerçekleşir
  const handleConfirmDelete = async () => {
    try {
      await deletePeriodDocument(selectedDocumentId); // API çağrısı
      setDocuments(documents.filter(doc => doc._id !== selectedDocumentId)); // Silinen dokümanı listeden çıkar
      setOpenDeleteDialog(false); // Dialogu kapat
      setSelectedDocumentId(null); // Seçili dokümanı sıfırla
    } catch (error) {
      console.error('Error deleting period document:', error);
    }
  };

  // Silme işlemi iptal edilirse dialog kapanır
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedDocumentId(null);
  };

  // Sayfa değişimi işlemi
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

   // Sayfa başına gösterilecek doküman sayısını değiştirme işlemi
   const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Sayfa başına doküman sayısı değiştiğinde ilk sayfaya dön
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Typography variant="h4">Dönem Dokümanları</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
          Yeni Doküman Ekle
        </Button>
      </Box>

      {/* Dönem Dokümanları Tablosu */}
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
            {Array.isArray(documents) && documents.length > 0 ? (
              documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.period?.name || 'Dönem Bilinmiyor'}</TableCell>
                  <TableCell>{doc.createdBy?.name || 'Kullanıcı Bilinmiyor'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(doc._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(doc._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Hiçbir doküman bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Sayfa Başına Gösterim ve Sayfa Değişimi */}
      <TablePagination
        component="div"
        count={totalDocuments} // Total document count
        page={page} // Current page
        onPageChange={handlePageChange} // Handle page change
        rowsPerPage={rowsPerPage} // Rows per page
        onRowsPerPageChange={handleRowsPerPageChange} // Handle rows per page change
        rowsPerPageOptions={[10, 25, 50]} // Options for rows per page
      />
      {/* Silme Onay Dialogu */}
      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Silmek istediğinizden emin misiniz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu işlemi geri alamazsınız. Dönem dokümanı silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeriodDocumentListPage;
