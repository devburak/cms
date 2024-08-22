import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Grid } from '@mui/material';
import PermissionSelector from './PermissionSelector';
import { createRole, updateRole, getRoleById, getPermissions } from '../../api'; // API işlemleri için

const RoleForm = ({ roleId, onSave }) => {
  const [role, setRole] = useState({
    name: '',
    permissions: [],
    isSuperAdmin: false,
  });

  const [allPermissions, setAllPermissions] = useState([]);

  useEffect(() => {
    // Tüm izinleri çekme
    getPermissions().then((data) => setAllPermissions(data?.permissions || []));

    if (roleId) {
      // Mevcut bir rol düzenleniyorsa, rol bilgilerini çek
      getRoleById(roleId).then((data) => setRole({
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions : [], // Eğer permissions array değilse, boş array yap
      }));
    }
  }, [roleId]);

  const handleChange = (event) => {
    const { name, checked, type } = event.target;

    if (name === 'isSuperAdmin' && checked) {
      // Eğer isSuperAdmin seçildiyse, tüm izinleri seç
      console.log(allPermissions)
      setRole((prev) => ({
        ...prev,
        isSuperAdmin: checked,
        permissions: allPermissions,
      }));
    } else if (name === 'isSuperAdmin' && !checked) {
      // isSuperAdmin kaldırıldığında, sadece checkbox durumu değişir
      setRole((prev) => ({
        ...prev,
        isSuperAdmin: checked,
      }));
    } else {
      setRole((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : event.target.value,
      }));
    }
  };

  const handlePermissionChange = (permissions) => {
    setRole((prev) => ({
      ...prev,
      permissions,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (roleId) {
        await updateRole(roleId, role);
      } else {
        await createRole(role);
      }
      onSave(); // Kayıt başarılı olursa, listeyi güncelle
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{padding:12}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Role Name"
            name="name"
            value={role.name}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <PermissionSelector
            selectedPermissions={role.permissions}
            onChange={handlePermissionChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={role.isSuperAdmin}
                onChange={handleChange}
                name="isSuperAdmin"
              />
            }
            label="Super Admin"
          />
        </Grid>
        <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" size="small">
            {roleId ? 'Update Role' : 'Create Role'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default RoleForm;
