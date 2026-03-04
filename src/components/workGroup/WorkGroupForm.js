import React, { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import slugify from 'slugify';

const createMember = () => ({
  firstName: '',
  lastName: '',
  role: '',
  unit: '',
  chamber: null,
});

const toCleanText = (input) => {
  if (input === null || input === undefined) {
    return '';
  }

  const isInvalidObjectLiteralString = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === '[object object]' || normalized === 'object object';
  };

  if (typeof input === 'string' || typeof input === 'number') {
    const normalized = String(input).trim();
    return isInvalidObjectLiteralString(normalized) ? '' : normalized;
  }

  if (typeof input === 'object') {
    const objectCandidates = [input.name, input.short, input.label, input.title, input.text];
    for (const candidate of objectCandidates) {
      if (typeof candidate === 'string' || typeof candidate === 'number') {
        const normalized = String(candidate).trim();
        if (normalized && !isInvalidObjectLiteralString(normalized)) {
          return normalized;
        }
      }
    }
  }

  return '';
};

const normalizeMemberChamberForForm = (chamber) => {
  if (!chamber) {
    return null;
  }

  if (typeof chamber === 'string') {
    const chamberText = String(chamber).trim();
    if (!chamberText) {
      return null;
    }

    return {
      chamberId: null,
      _id: null,
      name: chamberText,
      short: chamberText,
    };
  }

  const chamberId = chamber.chamberId || chamber._id || chamber.id || null;
  const nestedChamber =
    chamber && typeof chamber.chamber === 'object' && chamber.chamber !== null
      ? chamber.chamber
      : null;
  const name =
    toCleanText(chamber.name) ||
    toCleanText(chamber.label) ||
    toCleanText(chamber.title) ||
    toCleanText(nestedChamber?.name);
  const short =
    toCleanText(chamber.short) ||
    toCleanText(chamber.code) ||
    toCleanText(nestedChamber?.short);

  if (!chamberId && !name && !short) {
    return null;
  }

  return {
    chamberId: chamberId || null,
    _id: chamberId || chamber._id || null,
    name,
    short,
  };
};

const normalizeMemberForForm = (member = {}) => ({
  firstName: String(member?.firstName || '').trim(),
  lastName: String(member?.lastName || '').trim(),
  role: String(member?.role || '').trim(),
  unit: String(member?.unit || '').trim(),
  chamber: normalizeMemberChamberForForm(member?.chamber),
  sortOrder: Number(member?.sortOrder || 0),
});

const mapChamberForPayload = (chamber) => {
  const normalized = normalizeMemberChamberForForm(chamber);
  if (!normalized) {
    return null;
  }

  return {
    chamberId: normalized.chamberId || normalized._id || null,
    name: normalized.name || '',
    short: normalized.short || '',
  };
};

const getChamberOptionLabel = (option) => {
  const short = toCleanText(option?.short) || toCleanText(option?.code);
  const name = toCleanText(option?.name) || toCleanText(option?.label) || toCleanText(option);

  if (short && name && short !== name) {
    return `${short} - ${name}`;
  }

  return name || short || '';
};

const initialState = {
  name: '',
  slug: '',
  description: '',
  period: null,
  members: [createMember()],
  isListed: true,
  sortOrder: 0,
};

export default function WorkGroupForm({
  selectedWorkGroup,
  periods = [],
  chambers = [],
  onSave,
}) {
  const [workGroup, setWorkGroup] = useState(initialState);

  useEffect(() => {
    if (!selectedWorkGroup) {
      setWorkGroup(initialState);
      return;
    }

    setWorkGroup({
      ...initialState,
      ...selectedWorkGroup,
      period: selectedWorkGroup.period || null,
      members:
        Array.isArray(selectedWorkGroup.members) && selectedWorkGroup.members.length > 0
          ? selectedWorkGroup.members.map((member) => normalizeMemberForForm(member))
          : [createMember()],
    });
  }, [selectedWorkGroup]);

  const selectedPeriod = useMemo(() => {
    if (!workGroup.period) return null;
    const periodId = workGroup.period._id || workGroup.period;
    return periods.find((item) => item._id === periodId) || workGroup.period;
  }, [periods, workGroup.period]);

  const handleNameChange = (event) => {
    const name = event.target.value;
    setWorkGroup((prev) => ({
      ...prev,
      name,
      slug: slugify(name, { lower: true, strict: true }).replace(/\./g, '-'),
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setWorkGroup((prev) => ({
      ...prev,
      members: prev.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleAddMember = () => {
    setWorkGroup((prev) => ({
      ...prev,
      members: [...prev.members, createMember()],
    }));
  };

  const handleRemoveMember = (index) => {
    setWorkGroup((prev) => {
      const nextMembers = prev.members.filter((_, memberIndex) => memberIndex !== index);
      return {
        ...prev,
        members: nextMembers.length > 0 ? nextMembers : [createMember()],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...workGroup,
      period: selectedPeriod?._id || null,
      members: workGroup.members
        .filter((member) => member.firstName && member.lastName)
        .map((member, memberIndex) => ({
          ...member,
          chamber: mapChamberForPayload(member.chamber),
          sortOrder: Number(member?.sortOrder ?? memberIndex) || memberIndex,
        })),
    });
    setWorkGroup(initialState);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setWorkGroup(initialState);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              size="small"
              fullWidth
              label="Çalışma Grubu Adı"
              value={workGroup.name}
              onChange={handleNameChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              size="small"
              fullWidth
              label="Slug"
              value={workGroup.slug}
              onChange={(event) => setWorkGroup((prev) => ({ ...prev, slug: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={periods}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              value={selectedPeriod}
              onChange={(event, newValue) => setWorkGroup((prev) => ({ ...prev, period: newValue || null }))}
              renderInput={(params) => (
                <TextField {...params} label="Dönem" size="small" required />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Sıralama"
              value={workGroup.sortOrder}
              onChange={(event) =>
                setWorkGroup((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(workGroup.isListed)}
                  onChange={(event) =>
                    setWorkGroup((prev) => ({ ...prev, isListed: event.target.checked }))
                  }
                />
              }
              label="Listelensin"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              label="Açıklama"
              value={workGroup.description}
              onChange={(event) =>
                setWorkGroup((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Üyeler</Typography>
          </Grid>

          {workGroup.members.map((member, index) => {
            const memberChamberId =
              member?.chamber?.chamberId || member?.chamber?._id || member?.chamber?.id || null;
            const selectedChamber =
              chambers.find((item) => item?._id === memberChamberId) ||
              normalizeMemberChamberForForm(member?.chamber);

            return (
              <Grid item xs={12} key={`member-${index}`}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <TextField
                        required
                        size="small"
                        fullWidth
                        label="Ad"
                        value={member.firstName}
                        onChange={(event) => handleMemberChange(index, 'firstName', event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        required
                        size="small"
                        fullWidth
                        label="Soyad"
                        value={member.lastName}
                        onChange={(event) => handleMemberChange(index, 'lastName', event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Nitelik"
                        value={member.role}
                        onChange={(event) => handleMemberChange(index, 'role', event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Birim"
                        value={member.unit}
                        onChange={(event) => handleMemberChange(index, 'unit', event.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        options={chambers}
                        getOptionLabel={getChamberOptionLabel}
                        isOptionEqualToValue={(option, value) =>
                          option?._id === (value?._id || value?.chamberId || value?.id)
                        }
                        value={selectedChamber || null}
                        onChange={(event, newValue) =>
                          handleMemberChange(index, 'chamber', normalizeMemberChamberForForm(newValue))
                        }
                        renderInput={(params) => <TextField {...params} size="small" label="Odası" />}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton onClick={() => handleRemoveMember(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}

          <Grid item xs={12}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddMember}>
              Uye Ekle
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button fullWidth type="submit" variant="contained">
              {workGroup._id ? 'Çalışma Grubunu Güncelle' : 'Çalışma Grubu Oluştur'}
            </Button>
          </Grid>
          {workGroup._id ? (
            <Grid item xs={12} md={6}>
              <Button fullWidth variant="outlined" color="warning" onClick={handleCancel}>
                Vazgeç
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </form>
    </Paper>
  );
}
