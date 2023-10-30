import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext'; // AuthContext'in bulunduğu dosyanın yolu

const UserList = ({ users }) => {
    const { user } = useAuth(); // Kimlik bilgilerini al

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    {user?.role === 'admin' && (
                        <>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </>
                    )}
                </TableRow>
            </TableHead>
            <TableBody>
                {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                        <TableCell>{userItem.username}</TableCell>
                        <TableCell>{userItem.name}</TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>{userItem.phone}</TableCell>
                        {user?.role === 'admin' && (
                            <>
                                <TableCell>{userItem.role}</TableCell>
                                <TableCell>
                                    <IconButton color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="secondary">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default UserList;
