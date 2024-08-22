import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { getPermissions } from '../../api'; // API işlemleri için

const PermissionSelector = ({ selectedPermissions = [], onChange }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const {permissions =[]} = await getPermissions();
    console.log(permissions)
    setPermissions(permissions);
  };

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel size='small'>Permissions</InputLabel>
      <Select
        multiple
        size='small'
        value={selectedPermissions}
        onChange={handleChange}
        renderValue={(selected) => selected.join(', ')}
      >
        {permissions.map((permission , index) => (
          <MenuItem key={index+permission} value={permission}>
            <Checkbox checked={selectedPermissions.indexOf(permission) > -1} />
            <ListItemText primary={permission} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PermissionSelector;
