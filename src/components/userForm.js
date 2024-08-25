import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getAllRoles, createUser, updateUser, getUserById } from '../api'; // API işlemleri için

const UserForm = ({ userId, onSave }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Rolleri getir
    const fetchRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();

    // Eğer düzenleme modundaysak, kullanıcı bilgilerini getir
    if (userId) {
      const fetchUser = async () => {
        try {
          const userData = await getUserById(userId);
          setUser({
            name: userData.name,
            email: userData.email,
            role: userData.role._id, // Rol ID'sini al
            password: '', // Düzenleme sırasında şifre boş bırakılacak
          });
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

      fetchUser();
    }
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (userId) {
        // Güncelleme işlemi
        await updateUser(userId, user);
      } else {
        // Oluşturma işlemi
        await createUser(user);
      }
      onSave(); // Kayıt başarılı olursa listeyi güncelle
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            name="name"
            value={user.name}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        {!userId && (
          <Grid item xs={12}>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={user.password}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        )}
              <Grid item xs={12}>
                  <FormControl fullWidth required>
                      <InputLabel>Role</InputLabel>
                      {roles.length > 0 && (
                          <Select
                              name="role"
                              value={roles.some(role => role._id === user.role) ? user.role : ''}
                              onChange={handleChange}
                          >
                              {roles.map((role) => (
                                  <MenuItem key={role._id} value={role._id}>
                                      {role.name}
                                  </MenuItem>
                              ))}
                          </Select>
                      )}

                  </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {userId ? 'Update User' : 'Create User'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserForm;
