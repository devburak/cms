import React, { useState, useEffect } from 'react';
import { Paper, Grid, TextField, Button, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getAllBoardTypes, createBoardType, updateBoardType, deleteBoardType } from '../../api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const BoardTypeForm = () => {
    const { t } = useTranslation();
    const [boardTypes, setBoardTypes] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchBoardTypes();
    }, []);

    const fetchBoardTypes = async () => {
        try {
            const data = await getAllBoardTypes();
            setBoardTypes(data);
        } catch (error) {
            console.error('Error fetching board types:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateBoardType(editingId, formData);
            } else {
                await createBoardType(formData);
            }
            setFormData({ name: '', description: '' });
            setEditingId(null);
            fetchBoardTypes();
        } catch (error) {
            console.error('Error saving board type:', error);
        }
    };

    const handleEdit = (boardType) => {
        setFormData({ name: boardType.name, description: boardType.description });
        setEditingId(boardType._id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteBoardType(id);
            fetchBoardTypes();
        } catch (error) {
            console.error('Error deleting board type:', error);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label={t('Board Type Name')}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={t('Description')}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} container justifyContent="flex-end">
                        <Button type="submit" variant="contained" color="primary">
                            {editingId ? t('Update Board Type') : t('Create Board Type')}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <List>
                {boardTypes.map((boardType) => (
                    <ListItem key={boardType._id}>
                        <ListItemText primary={boardType.name} secondary={boardType.description} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEdit(boardType)} color="primary">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(boardType._id)} color="secondary">
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default BoardTypeForm;