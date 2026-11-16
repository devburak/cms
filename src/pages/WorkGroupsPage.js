import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Autocomplete, Box, Button, Container, Dialog, DialogContent, DialogTitle, FormControlLabel, Switch, LinearProgress, List, ListItem, ListItemText, Pagination, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { createWorkGroupFamily, createWorkGroupPeriod, deleteWorkGroupFamily, getAllContents, getAllPeriods, getChambers, getDecisions, getReports, getWorkGroupFamilies, getWorkGroupFamily, updateWorkGroup, updateWorkGroupFamily } from '../api';
import { notifyError, notifySuccess } from '../services/notificationBus';
import WorkGroupForm from '../components/workGroup/WorkGroupForm';
import ReportForm from '../components/report/ReportForm';
import DecisionForm from '../components/decision/DecisionForm';

const message = error => error?.response?.data?.error || 'İşlem tamamlanamadı';
export default function WorkGroupsPage() {
  const { hasPermission } = useAuth();
  const [families, setFamilies] = useState([]), [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null), [periodId, setPeriodId] = useState('');
  const [periods, setPeriods] = useState([]), [chambers, setChambers] = useState([]);
  const [search, setSearch] = useState(''), [tab, setTab] = useState(0), [page, setPage] = useState(1);
  const [rows, setRows] = useState([]), [pages, setPages] = useState(0), [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0), [addingPeriod, setAddingPeriod] = useState(false);
  const [familyForm, setFamilyForm] = useState(null), [editingDocument, setEditingDocument] = useState(null);
  useEffect(() => {
    let active = true;
    Promise.all([getWorkGroupFamilies(), getAllPeriods(), getChambers({ page: 1, limit: 300 })]).then(([groups, p, c]) => {
      if (active) { setFamilies(groups); setPeriods(p.periods || []); setChambers(c.data || []); }
    }).catch(error => { if (active) notifyError(message(error)); });
    return () => { active = false; };
  }, [reload]);
  useEffect(() => {
    let active = true; setDetail(null); setRows([]); setEditingDocument(null);
    if (selectedId) getWorkGroupFamily(selectedId, periodId ? { period: periodId } : {}).then(data => {
      if (active) { setDetail(data); if (!periodId) setPeriodId(data.activeTerm?.period?._id || ''); }
    }).catch(error => { if (active) notifyError(message(error)); });
    return () => { active = false; };
  }, [selectedId, periodId, reload]);
  const term = detail?.activeTerm;
  useEffect(() => {
    let active = true; setRows([]); setPages(0);
    if (!term?._id || tab === 0) return () => { active = false; };
    setLoading(true);
    const request = tab === 1 ? getAllContents({ workGroupId: term._id, page, limit: 10 }) : tab === 2 ? getDecisions({ workGroup: term._id, page, limit: 10 }) : getReports({ workGroup: term._id, page, limit: 10 });
    request.then(data => { if (active) { setRows(data.contents || data.data || []); setPages(data.totalPages || 0); } }).catch(error => { if (active) notifyError(message(error)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [term?._id, tab, page, reload]);
  const chooseFamily = family => { setSelectedId(family?._id || ''); setPeriodId(''); setTab(0); setPage(1); setAddingPeriod(false); };
  const savePeriod = async payload => {
    try {
      const saved = addingPeriod || !term ? await createWorkGroupPeriod(selectedId, payload) : await updateWorkGroup(term._id, payload);
      setAddingPeriod(false); setPeriodId(saved.period?._id || saved.period); setReload(value => value + 1); notifySuccess('Grup dönemi kaydedildi');
    } catch (error) { notifyError(message(error)); throw error; }
  };
  const saveFamily = async event => {
    event.preventDefault();
    try {
      const saved = familyForm._id ? await updateWorkGroupFamily(familyForm._id, familyForm) : await createWorkGroupFamily(familyForm);
      setFamilyForm(null); setReload(value => value + 1); chooseFamily(saved); notifySuccess('Çalışma grubu kaydedildi');
    } catch (error) { notifyError(message(error)); }
  };
  const documentSaved = text => { notifySuccess(text); setEditingDocument(null); setReload(value => value + 1); };
  const canEdit = hasPermission('updateWorkGroup'), canCreate = hasPermission('createWorkGroup');
  return <Container maxWidth="lg">
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1">Çalışma Grupları</Typography>
      {canCreate && <Button variant="contained" onClick={() => setFamilyForm({ name: '', description: '' })}>Yeni çalışma grubu</Button>}
    </Stack>
    <Autocomplete options={families} value={families.find(f => f._id === selectedId) || null} getOptionLabel={f => f.name} isOptionEqualToValue={(a, b) => a._id === b._id}
      onChange={(event, value) => chooseFamily(value)} renderInput={params => <TextField {...params} label="Çalışma grubu seçin" />} sx={{ mb: 3 }} />
    {!selectedId ? <Paper sx={{ p: 2 }}>
      <TextField fullWidth size="small" label="Grup ara" value={search} onChange={event => setSearch(event.target.value)} />
      <List>{families.filter(f => f.name.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))).map(f => <ListItem key={f._id} secondaryAction={<Button onClick={() => chooseFamily(f)}>Aç</Button>}>
        <ListItemText primary={f.name} secondary={`${f.periodCount} dönem`} />
      </ListItem>)}</List>
    </Paper> : !detail ? <LinearProgress /> : <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Box><Typography variant="h5">{detail.name}</Typography><Typography color="text.secondary">{detail.description}</Typography></Box>
          <Stack direction="row" spacing={1}>
            {canEdit && <Button onClick={() => setFamilyForm({ ...detail, activeTerm: undefined, periods: undefined })}>Grubu düzenle</Button>}
            {canCreate && <Button onClick={() => { setAddingPeriod(true); setTab(0); }}>Dönem ekle</Button>}
            {!detail.periods.length && hasPermission('deleteWorkGroup') && <Button color="error" onClick={async () => {
              if (!window.confirm('Bu çalışma grubunu silmek istiyor musunuz?')) return;
              try { await deleteWorkGroupFamily(detail._id); chooseFamily(null); setReload(v => v + 1); } catch (error) { notifyError(message(error)); }
            }}>Sil</Button>}
          </Stack>
        </Stack>
        {!addingPeriod && detail.periods.length > 0 && <TextField select fullWidth SelectProps={{ native: true }} label="Dönem" value={periodId} sx={{ mt: 2 }} onChange={event => { setPeriodId(event.target.value); setPage(1); setEditingDocument(null); }}>
          {detail.periods.map(item => <option key={item._id} value={item.period._id}>{item.period.name}</option>)}
        </TextField>}
      </Paper>
      {!term && !addingPeriod && <Alert severity="info">Bu gruba henüz dönem eklenmedi. Üyeleri ve içerikleri yönetmek için dönem ekleyin.</Alert>}
      {(term || addingPeriod) && <>
        {!addingPeriod && <Tabs value={tab} onChange={(event, value) => { setTab(value); setPage(1); setEditingDocument(null); }} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
          <Tab label="Üyeler" /><Tab label="İçerikler" /><Tab label="Kararlar" /><Tab label="Raporlar" />
        </Tabs>}
        {tab === 0 ? (canEdit || addingPeriod ? <>
          {addingPeriod && <Button onClick={() => setAddingPeriod(false)} sx={{ mb: 2 }}>Dönem eklemekten vazgeç</Button>}
          <WorkGroupForm key={addingPeriod ? 'new-period' : term?._id} family={detail} selectedWorkGroup={addingPeriod ? null : term}
            periods={periods.filter(p => !addingPeriod || !detail.periods.some(t => t.period._id === p._id))} chambers={chambers} onSave={savePeriod} />
        </> : <List>{(term.members || []).map((member, index) => <ListItem key={index}><ListItemText primary={`${member.firstName} ${member.lastName}`} secondary={member.role} /></ListItem>)}</List>) : <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h6">{['', 'İçerikler', 'Kararlar', 'Raporlar'][tab]}</Typography>
            {tab === 1 && hasPermission('createContent') && <Button component={RouterLink} to={`/content?workGroupId=${term._id}&periodId=${term.period._id}`}>Yeni içerik</Button>}
            {tab === 2 && hasPermission('createDecision') && <Button onClick={() => setEditingDocument({ workGroup: term, period: term.period, decisionType: 'work-group' })}>Yeni karar</Button>}
            {tab === 3 && hasPermission('createReport') && <Button onClick={() => setEditingDocument({ workGroup: term, period: term.period })}>Yeni rapor</Button>}
          </Stack>
          {loading && <LinearProgress />}
          {!loading && rows.length === 0 && <Typography>Bu dönem için kayıt bulunmuyor.</Typography>}
          <List>{rows.map(row => <ListItem key={row._id} secondaryAction={tab === 1 ? <Button component={RouterLink} to={`/content/${row._id}`}>Aç</Button> : <Button onClick={() => setEditingDocument(row)}>Aç</Button>}>
            <ListItemText primary={row.title} secondary={[row.period?.name, row.status].filter(Boolean).join(' · ')} />
          </ListItem>)}</List>
          {pages > 1 && <Pagination count={pages} page={page} onChange={(event, value) => setPage(value)} />}
        </Paper>}
      </>}
    </>}
    <Dialog open={Boolean(familyForm)} onClose={() => setFamilyForm(null)} fullWidth maxWidth="sm"><DialogTitle>{familyForm?._id ? 'Çalışma grubunu düzenle' : 'Yeni çalışma grubu'}</DialogTitle><DialogContent>
      {familyForm && <Box component="form" onSubmit={saveFamily} sx={{ pt: 1 }}><Stack spacing={2}>
        <TextField label="Çalışma grubu adı" required value={familyForm.name} onChange={event => setFamilyForm(f => ({ ...f, name: event.target.value }))} />
        <TextField label="Genel açıklama" multiline minRows={2} value={familyForm.description || ''} onChange={event => setFamilyForm(f => ({ ...f, description: event.target.value }))} />
        <FormControlLabel label="Sitede listelensin" control={<Switch checked={familyForm.isListed !== false} onChange={event => setFamilyForm(f => ({ ...f, isListed: event.target.checked }))} />} />
        <Button type="submit" variant="contained">Kaydet</Button>
      </Stack></Box>}
    </DialogContent></Dialog>
    <Dialog open={Boolean(editingDocument)} onClose={() => setEditingDocument(null)} fullWidth maxWidth="lg"><DialogTitle>{tab === 2 ? 'Karar' : 'Rapor'}</DialogTitle><DialogContent>
      {editingDocument && (tab === 2 ? <DecisionForm decision={editingDocument} onSuccess={documentSaved} onError={notifyError} /> : <ReportForm report={editingDocument} onSuccess={documentSaved} onError={notifyError} />)}
    </DialogContent></Dialog>
  </Container>;
}
