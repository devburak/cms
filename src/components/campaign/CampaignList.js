import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, IconButton, Pagination } from '@mui/material';
import { getAllCampaigns, deleteCampaign, updateCampaign } from '../../api';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1); // Mevcut sayfa
  const [totalPages, setTotalPages] = useState(0); // Toplam sayfa sayısı
  const [limit] = useState(10); // Sayfa başına gösterilecek kayıt sayısı
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [page]);

  const fetchCampaigns = async () => {
    try {
      const data = await getAllCampaigns({}, page, limit);
      setCampaigns(data?.campaigns || []);
      setTotalPages(Math.ceil(data.total / limit)); // Toplam sayfa sayısını hesapla
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const getSmallThumbnail = (media) => {
    if (media?.mediaId?.thumbnails) {
      const smallThumbnail = media.mediaId.thumbnails.find((thumb) => thumb.size === 'small');
      return smallThumbnail?.url || media.mediaId.url; // Small bulunmazsa orijinal URL'yi döndür
    }
    return null; // Thumbnail veya medya yoksa null döndür
  };

  const handleDelete = async (id) => {
    try {
      await deleteCampaign(id);
      fetchCampaigns(); // Listeyi güncelle
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleToggleActive = async (campaign) => {
    try {
      await updateCampaign(campaign._id, { isActive: !campaign.isActive });
      fetchCampaigns(); // Listeyi güncelle
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value); // Sayfayı güncelle
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Başlık</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Görsel</TableCell>
            <TableCell>Aksiyonlar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign._id}>
              <TableCell>{campaign.title}</TableCell>
              <TableCell>
                {campaign.link?.length > 20 ? `${campaign.link.slice(0, 20)}...` : campaign.link}
              </TableCell>
              <TableCell>
                <Switch
                  checked={campaign.isActive}
                  onChange={() => handleToggleActive(campaign)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={getSmallThumbnail(campaign.squareMedia) || getSmallThumbnail(campaign.horizontalMedia)}
                  alt={campaign.title}
                  style={{ width: 50, height: 50 }}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => navigate(`/campaign/${campaign._id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(campaign._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        count={totalPages} // Toplam sayfa sayısı
        page={page} // Mevcut sayfa
        onChange={handlePageChange} // Sayfa değişimi fonksiyonu
        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
      />
    </TableContainer>
  );
};

export default CampaignList;
