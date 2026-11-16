import React, { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export const groupIdentity = group => String(group?.family?._id || group?.family || group?._id || '');
export function uniqueWorkGroups(groups = []) {
  const result = new Map();
  for (const group of groups) {
    const key = groupIdentity(group);
    if (!key || result.has(key)) continue;
    result.set(key, { _id: key, name: group.family?.name || group.name, slug: group.family?.slug || group.slug });
  }
  return [...result.values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}
// Keep original period-record IDs for unchanged selections, including historical exceptions.
export default function WorkGroupSelector({ groups = [], value, onChange, multiple = false, label = 'Çalışma grubu', helperText = '', ...props }) {
  const selected = multiple ? (value || []) : value ? [value] : [];
  const options = useMemo(() => uniqueWorkGroups([...groups, ...selected]), [groups, value]); // eslint-disable-line react-hooks/exhaustive-deps
  const chosen = selected.map(item => options.find(option => option._id === groupIdentity(item))).filter(Boolean);
  const preserve = option => selected.find(item => groupIdentity(item) === option._id) || option;
  return <Autocomplete {...props} multiple={multiple} options={options} value={multiple ? chosen : chosen[0] || null}
    getOptionLabel={option => option.name || ''} isOptionEqualToValue={(option, item) => option._id === item._id}
    onChange={(event, next) => onChange(multiple ? next.map(preserve) : next ? preserve(next) : null)}
    renderInput={params => <TextField {...params} label={label} size="small" helperText={helperText} />} />;
}
