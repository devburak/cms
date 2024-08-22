import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../api'; // API işlemleri için

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers(); // Silme işleminden sonra listeyi yenile
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/user/${userId}`);
  };

  const isLastSuperAdmin = users.filter(user => user.role?.isSuperAdmin).length === 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Adı</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Rol</strong></TableCell>
            <TableCell><strong>İşlemler</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role?.name} {user.role?.isSuperAdmin && <Typography component="span" sx={{ fontWeight: 'bold', color: 'red' }}> (Super Admin)</Typography>}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(user._id)} aria-label="edit">
                  <EditIcon />
                </IconButton>
                {!user.role?.isSuperAdmin || !isLastSuperAdmin ? (
                  <IconButton onClick={() => handleDelete(user._id)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <Typography component="span" sx={{ fontWeight: 'bold', color: 'gray' }}>Silinemez</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersPage;
