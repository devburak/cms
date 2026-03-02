import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem as MuiMenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import slugify from 'slugify';
import FeaturedImageUpload from '../file/featuredImage';
import {
  createMenu,
  createMenuItem,
  deleteMenu,
  deleteMenuItem,
  getAllContents,
  getMenuById,
  getMenus,
  updateMenu,
  updateMenuItem
} from '../../api';
import { notifyError, notifySuccess } from '../../services/notificationBus';

const createEmptyMenuForm = () => ({
  name: '',
  slug: '',
  description: '',
  isActive: true
});

const createEmptyItemForm = () => ({
  text: '',
  accessibilityLabel: '',
  displayType: 'text',
  linkType: 'external',
  url: '',
  linkedContent: null,
  target: '_self',
  order: 0,
  parent: '',
  isActive: true,
  image: null,
  icon: {
    source: 'mui',
    value: ''
  }
});

const normalizeImage = (image) => {
  if (!image) {
    return null;
  }

  const media = image.mediaId && typeof image.mediaId === 'object' ? image.mediaId : null;

  return {
    mediaId: media?._id || image.mediaId || null,
    url: media?.url || image.url || '',
    altText: image.altText || media?.altText || '',
    mediaType: 'image'
  };
};

const buildMenuFormState = (menu) => ({
  name: menu?.name || '',
  slug: menu?.slug || '',
  description: menu?.description || '',
  isActive: typeof menu?.isActive === 'boolean' ? menu.isActive : true
});

const buildItemFormState = (item) => ({
  text: item?.text || '',
  accessibilityLabel: item?.accessibilityLabel || '',
  displayType: item?.displayType || 'text',
  linkType: item?.linkType || 'external',
  url: item?.linkType === 'external' ? item?.url || '' : '',
  linkedContent: item?.linkedContent || null,
  target: item?.target || '_self',
  order: Number.isFinite(Number(item?.order)) ? Number(item.order) : 0,
  parent: item?.parent?._id || item?.parent || '',
  isActive: typeof item?.isActive === 'boolean' ? item.isActive : true,
  image: normalizeImage(item?.image),
  icon: {
    source: item?.icon?.source || 'mui',
    value: item?.icon?.value || ''
  }
});

const getItemLabel = (item) => item?.text || item?.accessibilityLabel || 'Isimsiz item';

const flattenTree = (nodes = [], depth = 0, collector = []) => {
  nodes.forEach((node) => {
    collector.push({ ...node, depth });
    flattenTree(node.children || [], depth + 1, collector);
  });

  return collector;
};

const collectDescendantIds = (items = [], rootId) => {
  const descendants = [];
  const queue = [String(rootId)];

  while (queue.length > 0) {
    const currentParent = queue.shift();
    items
      .filter((item) => String(item.parent?._id || item.parent || '') === currentParent)
      .forEach((child) => {
        const childId = String(child._id);
        descendants.push(childId);
        queue.push(childId);
      });
  }

  return descendants;
};

const buildLinkSummary = (item) => {
  if (item?.linkType === 'content') {
    return item?.linkedContent?.slug
      ? `Sayfa: /${item.linkedContent.slug}`
      : 'Icerik baglantisi';
  }

  if (item?.linkType === 'none') {
    return 'Baglanti yok';
  }

  return item?.url || '-';
};

function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuForm, setMenuForm] = useState(createEmptyMenuForm());
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemForm, setItemForm] = useState(createEmptyItemForm());
  const [savingItem, setSavingItem] = useState(false);
  const [contentOptions, setContentOptions] = useState([]);
  const [loadingContents, setLoadingContents] = useState(false);

  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const response = await getMenus({ limit: 100 });
      setMenus(response?.menus || []);
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menuler alinamadi.');
    } finally {
      setLoadingMenus(false);
    }
  };

  const loadMenuDetails = async (menuId) => {
    try {
      const response = await getMenuById(menuId);
      setSelectedMenu(response);
      setMenuForm(buildMenuFormState(response));
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menu detayi alinamadi.');
    }
  };

  const loadContentOptions = async (searchText = '') => {
    setLoadingContents(true);
    try {
      const response = await getAllContents({ title: searchText, limit: 10 });
      setContentOptions(response?.contents || []);
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Sayfa listesi alinamadi.');
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleStartNewMenu = () => {
    setSelectedMenu(null);
    setMenuForm(createEmptyMenuForm());
  };

  const handleMenuNameChange = (event) => {
    const nextName = event.target.value;
    setMenuForm((prev) => ({
      ...prev,
      name: nextName,
      slug: !selectedMenu && prev.slug === slugify(prev.name || '', { lower: true, strict: true })
        ? slugify(nextName, { lower: true, strict: true })
        : prev.slug || slugify(nextName, { lower: true, strict: true })
    }));
  };

  const handleSaveMenu = async () => {
    if (!menuForm.name.trim() || !menuForm.slug.trim()) {
      notifyError('Menu adi ve slug zorunludur.');
      return;
    }

    setSavingMenu(true);
    try {
      const payload = {
        ...menuForm,
        slug: menuForm.slug.trim()
      };

      const response = selectedMenu?._id
        ? await updateMenu(selectedMenu._id, payload)
        : await createMenu(payload);

      setSelectedMenu(response);
      setMenuForm(buildMenuFormState(response));
      notifySuccess('Menu kaydedildi.');
      await loadMenus();
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menu kaydedilemedi.');
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async (menu) => {
    if (!window.confirm(`"${menu.name}" menusunu silmek istediginize emin misiniz?`)) {
      return;
    }

    try {
      await deleteMenu(menu._id);
      if (selectedMenu?._id === menu._id) {
        handleStartNewMenu();
      }
      notifySuccess('Menu silindi.');
      await loadMenus();
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menu silinemedi.');
    }
  };

  const handleOpenItemDialog = async (item = null) => {
    if (!(selectedMenu?._id)) {
      notifyError('Once menuyu kaydetmelisiniz.');
      return;
    }

    const nextForm = item ? buildItemFormState(item) : createEmptyItemForm();
    setCurrentItem(item);
    setItemForm(nextForm);

    const seedOptions = [];
    if (item?.linkedContent?._id) {
      seedOptions.push(item.linkedContent);
    }
    setContentOptions(seedOptions);
    setItemDialogOpen(true);

    if (!item?.linkedContent?._id) {
      await loadContentOptions('');
    }
  };

  const handleCloseItemDialog = () => {
    setItemDialogOpen(false);
    setCurrentItem(null);
    setItemForm(createEmptyItemForm());
    setContentOptions([]);
  };

  const handleSaveItem = async () => {
    if (!(selectedMenu?._id)) {
      notifyError('Menu secilmedi.');
      return;
    }

    if ((itemForm.displayType === 'text' || itemForm.displayType === 'icon_text') && !itemForm.text.trim()) {
      notifyError('Bu item tipi icin metin zorunludur.');
      return;
    }

    if ((itemForm.displayType === 'image' || itemForm.displayType === 'icon') && !itemForm.accessibilityLabel.trim()) {
      notifyError('Gorsel veya icon itemlarinda erisilebilirlik etiketi zorunludur.');
      return;
    }

    if (itemForm.linkType === 'external' && !itemForm.url.trim()) {
      notifyError('Dis baglanti icin link zorunludur.');
      return;
    }

    if (itemForm.linkType === 'content' && !itemForm.linkedContent?._id) {
      notifyError('Bir CMS sayfasi secmelisiniz.');
      return;
    }

    setSavingItem(true);
    try {
      const payload = {
        text: itemForm.text,
        accessibilityLabel: itemForm.accessibilityLabel,
        displayType: itemForm.displayType,
        linkType: itemForm.linkType,
        url: itemForm.url,
        linkedContent: itemForm.linkedContent?._id || null,
        target: itemForm.target,
        order: Number(itemForm.order) || 0,
        parent: itemForm.parent || null,
        isActive: itemForm.isActive
      };

      if (itemForm.displayType === 'image') {
        payload.image = itemForm.image
          ? {
              mediaId: itemForm.image.mediaId || null,
              url: itemForm.image.url || '',
              altText: itemForm.image.altText || '',
              mediaType: 'image'
            }
          : null;
      }

      if (itemForm.displayType === 'icon' || itemForm.displayType === 'icon_text') {
        payload.icon = {
          source: itemForm.icon.source,
          value: itemForm.icon.value
        };
      }

      if (currentItem?._id) {
        await updateMenuItem(selectedMenu._id, currentItem._id, payload);
        notifySuccess('Menu item guncellendi.');
      } else {
        await createMenuItem(selectedMenu._id, payload);
        notifySuccess('Menu item olusturuldu.');
      }

      await loadMenuDetails(selectedMenu._id);
      await loadMenus();
      handleCloseItemDialog();
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menu item kaydedilemedi.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!(selectedMenu?._id)) {
      return;
    }

    if (!window.confirm(`"${getItemLabel(item)}" itemini silmek istediginize emin misiniz? Alt itemlar da silinir.`)) {
      return;
    }

    try {
      await deleteMenuItem(selectedMenu._id, item._id);
      notifySuccess('Menu item silindi.');
      await loadMenuDetails(selectedMenu._id);
      await loadMenus();
    } catch (error) {
      notifyError(error?.response?.data?.message || 'Menu item silinemedi.');
    }
  };

  const menuItems = selectedMenu?.items || [];
  const menuTreeRows = flattenTree(selectedMenu?.tree || []);
  const flattenedItemRows = menuTreeRows.map((treeNode) => ({
    treeNode,
    item: menuItems.find((candidate) => String(candidate._id) === String(treeNode._id))
  }));
  const excludedDescendants = currentItem?._id ? collectDescendantIds(menuItems, currentItem._id) : [];
  const availableParents = menuItems.filter((item) => (
    String(item._id) !== String(currentItem?._id || '') &&
    !excludedDescendants.includes(String(item._id))
  ));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Menuler</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleStartNewMenu}>
              Yeni Menu
            </Button>
          </Stack>

          {loadingMenus ? <Alert severity="info">Menuler yukleniyor...</Alert> : null}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ad</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">Islem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow
                    key={menu._id}
                    hover
                    selected={selectedMenu?._id === menu._id}
                    onClick={() => loadMenuDetails(menu._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{menu.name}</TableCell>
                    <TableCell>{menu.slug}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={menu.isActive ? 'Aktif' : 'Pasif'}
                        color={menu.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <IconButton size="small" onClick={() => loadMenuDetails(menu._id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteMenu(menu)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {menus.length === 0 && !loadingMenus ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Henuz menu bulunmuyor.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">
                  {selectedMenu?._id ? 'Menu Detayi' : 'Yeni Menu'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Her menu bir slug ile client tarafinda cagrilabilir.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Menu Adi"
                    fullWidth
                    value={menuForm.name}
                    onChange={handleMenuNameChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Slug"
                    fullWidth
                    value={menuForm.slug}
                    onChange={(event) => setMenuForm((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Aciklama"
                    fullWidth
                    multiline
                    minRows={2}
                    value={menuForm.description}
                    onChange={(event) => setMenuForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={menuForm.isActive}
                        onChange={(event) => setMenuForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      />
                    )}
                    label="Aktif"
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveMenu}
                  disabled={savingMenu}
                >
                  {selectedMenu?._id ? 'Guncelle' : 'Olustur'}
                </Button>
                {selectedMenu?._id ? (
                  <Button variant="outlined" onClick={handleStartNewMenu}>
                    Yeni menu baslat
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">Menu Itemlari</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alt menu iliskisi parent ve order alanlari ile yonetilir.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenItemDialog()}
                  disabled={!(selectedMenu?._id)}
                >
                  Item Ekle
                </Button>
              </Stack>

              {!(selectedMenu?._id) ? (
                <Alert severity="info">
                  Item ekleyebilmek icin once menuyu kaydetmeniz gerekiyor.
                </Alert>
              ) : null}

              {selectedMenu?._id ? (
                <>
                  <Divider />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Tip</TableCell>
                          <TableCell>Baglanti</TableCell>
                          <TableCell>Parent</TableCell>
                          <TableCell>Siralama</TableCell>
                          <TableCell>Durum</TableCell>
                          <TableCell align="right">Islem</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {flattenedItemRows.map(({ treeNode, item }) => (
                          <TableRow key={treeNode._id}>
                            <TableCell>
                              <Box sx={{ pl: treeNode.depth * 2 }}>
                                <Typography variant="body2">
                                  {`${treeNode.depth > 0 ? '|- ' : ''}${getItemLabel(item || treeNode)}`}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{item?.displayType || treeNode.displayType}</TableCell>
                            <TableCell>{buildLinkSummary(item)}</TableCell>
                            <TableCell>{item?.parent?.text || '-'}</TableCell>
                            <TableCell>{item?.order ?? treeNode.order}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={item?.isActive ? 'Aktif' : 'Pasif'}
                                color={item?.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleOpenItemDialog(item)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteItem(item)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {flattenedItemRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              Bu menu icin henuz item bulunmuyor.
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Grid>

      <Dialog open={itemDialogOpen} onClose={handleCloseItemDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentItem?._id ? 'Menu Item Guncelle' : 'Yeni Menu Item'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gorunum Tipi</InputLabel>
                <Select
                  value={itemForm.displayType}
                  label="Gorunum Tipi"
                  onChange={(event) => setItemForm((prev) => ({ ...prev, displayType: event.target.value }))}
                >
                  <MuiMenuItem value="text">Text</MuiMenuItem>
                  <MuiMenuItem value="image">Image</MuiMenuItem>
                  <MuiMenuItem value="icon">Icon</MuiMenuItem>
                  <MuiMenuItem value="icon_text">Icon + Text</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Baglanti Tipi</InputLabel>
                <Select
                  value={itemForm.linkType}
                  label="Baglanti Tipi"
                  onChange={(event) => setItemForm((prev) => ({ ...prev, linkType: event.target.value }))}
                >
                  <MuiMenuItem value="external">Dis Link</MuiMenuItem>
                  <MuiMenuItem value="content">CMS Sayfasi</MuiMenuItem>
                  <MuiMenuItem value="none">Sadece Menu Basligi</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>

            {itemForm.displayType === 'text' || itemForm.displayType === 'icon_text' ? (
              <Grid item xs={12}>
                <TextField
                  label="Text"
                  fullWidth
                  value={itemForm.text}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, text: event.target.value }))}
                />
              </Grid>
            ) : null}

            {itemForm.displayType === 'image' ? (
              <>
                <Grid item xs={12}>
                  <FeaturedImageUpload
                    initialFile={itemForm.image || {}}
                    handleFeaturedImage={(image) => setItemForm((prev) => ({
                      ...prev,
                      image: {
                        mediaId: image.mediaId || image._id || null,
                        url: image.url || '',
                        altText: prev.image?.altText || '',
                        mediaType: 'image'
                      }
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Gorsel Alt Text"
                    fullWidth
                    value={itemForm.image?.altText || ''}
                    onChange={(event) => setItemForm((prev) => ({
                      ...prev,
                      image: {
                        ...(prev.image || {}),
                        altText: event.target.value
                      }
                    }))}
                  />
                </Grid>
              </>
            ) : null}

            {itemForm.displayType === 'icon' || itemForm.displayType === 'icon_text' ? (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Icon Kaynagi</InputLabel>
                    <Select
                      value={itemForm.icon.source}
                      label="Icon Kaynagi"
                      onChange={(event) => setItemForm((prev) => ({
                        ...prev,
                        icon: {
                          ...prev.icon,
                          source: event.target.value
                        }
                      }))}
                    >
                      <MuiMenuItem value="mui">MUI Icons</MuiMenuItem>
                      <MuiMenuItem value="svg">SVG</MuiMenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    label={itemForm.icon.source === 'mui' ? 'MUI Icon Adi' : 'SVG Kodu'}
                    fullWidth
                    multiline={itemForm.icon.source === 'svg'}
                    minRows={itemForm.icon.source === 'svg' ? 4 : 1}
                    value={itemForm.icon.value}
                    onChange={(event) => setItemForm((prev) => ({
                      ...prev,
                      icon: {
                        ...prev.icon,
                        value: event.target.value
                      }
                    }))}
                    helperText={itemForm.icon.source === 'mui' ? 'Ornek: Home, Article, Menu' : 'Raw SVG kodu girin.'}
                  />
                </Grid>
              </>
            ) : null}

            {itemForm.displayType === 'image' || itemForm.displayType === 'icon' ? (
              <Grid item xs={12}>
                <TextField
                  label="Erisilebilirlik Etiketi"
                  fullWidth
                  value={itemForm.accessibilityLabel}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, accessibilityLabel: event.target.value }))}
                />
              </Grid>
            ) : null}

            {itemForm.linkType === 'external' ? (
              <Grid item xs={12}>
                <TextField
                  label="Link"
                  fullWidth
                  value={itemForm.url}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, url: event.target.value }))}
                  helperText="Relative path veya tam URL girebilirsiniz."
                />
              </Grid>
            ) : null}

            {itemForm.linkType === 'content' ? (
              <Grid item xs={12}>
                <Autocomplete
                  options={contentOptions}
                  loading={loadingContents}
                  value={itemForm.linkedContent}
                  onChange={(event, value) => setItemForm((prev) => ({ ...prev, linkedContent: value }))}
                  onInputChange={(event, value, reason) => {
                    if (reason === 'input') {
                      loadContentOptions(value);
                    }
                  }}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  getOptionLabel={(option) => option?.title ? `${option.title} (${option.slug})` : ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="CMS Sayfasi"
                      helperText="Menu item dogrudan bir content kaydina baglanir."
                    />
                  )}
                />
              </Grid>
            ) : null}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nerede Acilsin</InputLabel>
                <Select
                  value={itemForm.target}
                  label="Nerede Acilsin"
                  onChange={(event) => setItemForm((prev) => ({ ...prev, target: event.target.value }))}
                >
                  <MuiMenuItem value="_self">Ayni sekme</MuiMenuItem>
                  <MuiMenuItem value="_blank">Yeni sekme</MuiMenuItem>
                  <MuiMenuItem value="_parent">Parent frame</MuiMenuItem>
                  <MuiMenuItem value="_top">Top frame</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Siralama"
                type="number"
                fullWidth
                value={itemForm.order}
                onChange={(event) => setItemForm((prev) => ({ ...prev, order: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={itemForm.isActive}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                )}
                label="Aktif"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Parent Item</InputLabel>
                <Select
                  value={itemForm.parent}
                  label="Parent Item"
                  onChange={(event) => setItemForm((prev) => ({ ...prev, parent: event.target.value }))}
                >
                  <MuiMenuItem value="">Ana seviye</MuiMenuItem>
                  {availableParents.map((item) => (
                    <MuiMenuItem key={item._id} value={item._id}>
                      {getItemLabel(item)}
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Oneri: Alt menusu olan ama tiklandiginda bir yere gitmeyecek itemlarda baglanti tipini "Sadece Menu Basligi" yapin.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>Vazgec</Button>
          <Button variant="contained" onClick={handleSaveItem} disabled={savingItem}>
            {currentItem?._id ? 'Guncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default MenuManager;
