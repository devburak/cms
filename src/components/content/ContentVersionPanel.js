import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getContentVersions, restoreContentVersion } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { notifyError, notifySuccess } from '../../services/notificationBus';

const versionTypeLabels = {
  initial: 'Ilk Surum',
  pre_update: 'Guncelleme Oncesi',
  pre_restore: 'Geri Yukleme Oncesi'
};

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('tr-TR');
}

function getVersionActor(version) {
  return (
    version?.versionedBy?.name ||
    version?.updatedBy?.name ||
    version?.createdBy?.name ||
    'Sistem'
  );
}

export default function ContentVersionPanel({ contentId, refreshKey = 0, onRestored }) {
  const { hasPermission } = useAuth();
  const canViewVersions = hasPermission('viewContentVersions');
  const canRestoreVersion = hasPermission('restoreContentVersion');

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restoringVersionId, setRestoringVersionId] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);

  const loadVersions = useCallback(async () => {
    if (!contentId || !canViewVersions) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getContentVersions(contentId);
      setVersions(response?.versions || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || loadError?.message || 'Versiyonlar yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [canViewVersions, contentId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions, refreshKey]);

  const latestVersionNumber = useMemo(() => {
    if (!versions.length) {
      return null;
    }

    return Math.max(...versions.map((version) => Number(version.versionNumber) || 0));
  }, [versions]);

  const handleRestoreConfirm = async () => {
    if (!selectedVersion?._id || !contentId) {
      return;
    }

    setRestoringVersionId(selectedVersion._id);

    try {
      const response = await restoreContentVersion(contentId, selectedVersion._id);
      notifySuccess(
        response?.changed
          ? `Icerik v${selectedVersion.versionNumber} surumune geri yuklendi.`
          : 'Secilen surum zaten mevcut icerikle ayni.'
      );
      setSelectedVersion(null);
      await loadVersions();
      if (onRestored) {
        await onRestored(response?.content || null);
      }
    } catch (restoreError) {
      notifyError(
        restoreError?.response?.data?.message || restoreError?.message || 'Versiyon geri yuklenemedi.'
      );
    } finally {
      setRestoringVersionId('');
    }
  };

  if (!contentId || !canViewVersions) {
    return null;
  }

  return (
    <>
      <Paper sx={{ mt: 2, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryOutlinedIcon fontSize="small" />
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Versiyon Gecmisi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kaydedilen onceki icerik durumlari burada listelenir.
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
            onClick={loadVersions}
            disabled={loading}
          >
            Yenile
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {!canRestoreVersion ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu rolde versiyonlari gorebilirsiniz ancak geri yukleme yetkiniz yok.
          </Alert>
        ) : null}

        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : null}

        {!loading && versions.length === 0 ? (
          <Alert severity="info">Bu icerik icin kayitli bir versiyon bulunmuyor.</Alert>
        ) : null}

        {!loading && versions.length > 0 ? (
          <List disablePadding>
            {versions.map((version, index) => (
              <React.Fragment key={version._id}>
                <ListItem
                  disableGutters
                  secondaryAction={
                    canRestoreVersion ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          restoringVersionId === version._id ? (
                            <CircularProgress size={14} />
                          ) : (
                            <RestoreIcon fontSize="small" />
                          )
                        }
                        disabled={Boolean(restoringVersionId)}
                        onClick={() => setSelectedVersion(version)}
                      >
                        Geri Yukle
                      </Button>
                    ) : null
                  }
                  sx={{ alignItems: 'flex-start', pr: canRestoreVersion ? 14 : 0 }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="subtitle2" fontWeight={700}>
                          v{version.versionNumber}
                        </Typography>
                        <Chip size="small" label={versionTypeLabels[version.versionType] || version.versionType} />
                        {latestVersionNumber === version.versionNumber ? (
                          <Chip size="small" color="primary" variant="outlined" label="Son Kayit" />
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.primary">
                          {version.title || '(Baslik yok)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Slug: {version.slug || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Durum: {version.status || '-'} | Kaydi olusturan: {getVersionActor(version)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kayit zamani: {formatDate(version.createdAt)}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                {index < versions.length - 1 ? <Divider component="li" /> : null}
              </React.Fragment>
            ))}
          </List>
        ) : null}
      </Paper>

      <Dialog open={Boolean(selectedVersion)} onClose={() => setSelectedVersion(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Versiyonu geri yukle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedVersion
              ? `v${selectedVersion.versionNumber} surumunu geri yuklemek uzeresiniz. Mevcut icerik otomatik olarak yeni bir versiyon olarak saklanacak.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVersion(null)} disabled={Boolean(restoringVersionId)}>
            Vazgec
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            variant="contained"
            color="warning"
            disabled={Boolean(restoringVersionId)}
          >
            Geri Yukle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
