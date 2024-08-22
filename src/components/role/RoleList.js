import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getAllRoles, deleteRole } from '../../api'; // API işlemleri için

const RoleList = ({ onEdit }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const data = await getAllRoles();
    setRoles(data);
  };

  const handleDelete = async (roleId) => {
    try {
      await deleteRole(roleId);
      fetchRoles(); // Silme işleminden sonra listeyi yenile
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const renderPermissions = (permissions) => {
    const visiblePermissions = permissions.slice(0, 3);
    const remainingCount = permissions.length - 3;

    return (
      <span>
        {visiblePermissions.join(', ')}
        {remainingCount > 0 && ` +${remainingCount}`}
      </span>
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Role Name</TableCell>
            <TableCell>Permissions</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role._id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{renderPermissions(role.permissions)}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(role._id)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(role._id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoleList;
