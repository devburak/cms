import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Pagination,
  Chip,
  Stack
} from '@mui/material';
import { getAllCampaigns, deleteCampaign, updateCampaign } from '../../api';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { notifyError, notifySuccess } from '../../services/notificationBus';

const placementLabel = {
  popup: 'Popup',
  banner: 'Banner',
  footer: 'Footer',
  left_menu: 'Sol Menü'
};

const popupFrequencyLabel = {
  every_login: 'Her giriş',
  daily: 'Günlük',
  once: 'Tek sefer'
};

const pageLabel = {
  home: 'Anasayfa',
  all: 'Tüm Sayfalar',
  detail: 'Detay'
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [page]);

  const fetchCampaigns = async () => {
    try {
      const data = await getAllCampaigns({}, page, limit);
      setCampaigns(data?.campaigns || []);
      setTotalPages(Math.max(1, Math.ceil((data?.total || 0) / limit)));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      notifyError('Kampanyalar alınamadı.');
    }
  };

  const getSmallThumbnail = (media) => {
    if (media?.mediaId?.thumbnails) {
      const smallThumbnail = media.mediaId.thumbnails.find((thumb) => thumb.size === 'small');
      return smallThumbnail?.url || media.mediaId.url;
    }
    return media?.url || null;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kampanya silinsin mi?')) return;

    try {
      await deleteCampaign(id);
      notifySuccess('Kampanya silindi.');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      notifyError('Kampanya silinemedi.');
    }
  };

  const handleToggleActive = async (campaign) => {
    try {
      await updateCampaign(campaign._id, { isActive: !campaign.isActive });
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      notifyError('Kampanya durumu güncellenemedi.');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Başlık</TableCell>
            <TableCell>Konum</TableCell>
            <TableCell>Sayfalar</TableCell>
            <TableCell>Popup Sıklığı</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Görsel</TableCell>
            <TableCell>Aksiyonlar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign) => {
            const targetPages = Array.isArray(campaign.targetPages) ? campaign.targetPages : [];
            return (
              <TableRow key={campaign._id}>
                <TableCell>{campaign.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={placementLabel[campaign.placement] || campaign.placement || '-'} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                    {targetPages.length ? (
                      targetPages.map((pageItem) => (
                        <Chip key={pageItem} size="small" variant="outlined" label={pageLabel[pageItem] || pageItem} />
                      ))
                    ) : (
                      <Chip size="small" variant="outlined" label="-" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {campaign.placement === 'popup' ? popupFrequencyLabel[campaign.popupFrequency] || campaign.popupFrequency : '-'}
                </TableCell>
                <TableCell>
                  <Switch checked={campaign.isActive} onChange={() => handleToggleActive(campaign)} />
                </TableCell>
                <TableCell>
                  {getSmallThumbnail(campaign.squareMedia) || getSmallThumbnail(campaign.horizontalMedia) ? (
                    <img
                      src={getSmallThumbnail(campaign.squareMedia) || getSmallThumbnail(campaign.horizontalMedia)}
                      alt={campaign.title}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  ) : (
                    '-'
                  )}
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
            );
          })}
        </TableBody>
      </Table>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
      />
    </TableContainer>
  );
};

export default CampaignList;
