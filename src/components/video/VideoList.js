import React, { useEffect, useState } from 'react';
import { getVideos, deleteVideo } from '../../api'; // Yolunuzu ayarlayın
import { Button, TextField, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Props: onEdit(videoId) -> Düzenleme butonuna tıklandığında bir üst bileşen id yi yakalasın
const VideoList = ({ onEdit , notificy }) => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);     // MUI tablo pagination 0-index kullanır
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      // API'deki page 1-index olduğundan page + 1
      const result = await getVideos({ search, page: page + 1, limit });
      setVideos(result.videos);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit , notificy]); // sayfa veya limit değişince tekrar getir

  // Arama yaptığımızda başa dönmek istersek page=0
  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  // Silme işlemi
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(id);
        fetchData(); // Silindikten sonra listeyi yenile
      } catch (err) {
        console.error('Error deleting video:', err);
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <TextField
          label="Search Videos"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video._id}>
              <TableCell>{video.title}</TableCell>
              <TableCell>{video.provider}</TableCell>
              <TableCell>{video.link}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => onEdit(video._id)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(video._id)} style={{ marginLeft: 8 }}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default VideoList;