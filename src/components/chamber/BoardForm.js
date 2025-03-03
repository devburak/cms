// components/chamber/BoardForm.js
import React, { useState, useEffect } from 'react';
import { Paper, Grid, TextField, Button, IconButton } from '@mui/material';
import { Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import { getAllPeriods, getAllChambers, getAllBoardTypes, createBoard } from '../../api';

const BoardForm = ({ board, onSuccess, onError }) => {
    const { t } = useTranslation();
    const [periods, setPeriods] = useState([]);
    const [chambers, setChambers] = useState([]);
    const [boardTypes, setBoardTypes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        type: null, 
        period: null,
        chamber: null,
        chamberPeriod: '',
        members: [{ title: '', name: '' }]
    });

    useEffect(() => {
        const fetchPeriodsAndChambers = async () => {
            try {
                const periodsData = await getAllPeriods();
                setPeriods(periodsData.periods || []);
                const chambersData = await getAllChambers();
                setChambers(chambersData.data || []);
            } catch (error) {
                console.error('Error fetching periods or chambers:', error);
            }
        };
        const fetchBoardTypes = async () => {
            try {
                const data = await getAllBoardTypes();
                setBoardTypes(data);
            } catch (error) {
                console.error('Error fetching board types:', error);
            }
        };
        fetchBoardTypes();
        fetchPeriodsAndChambers();

        if (board) {
            setFormData({
                name: board.name,
                type: board.type || null,
                period: board.period || null,
                chamber: board.chamber || null,
                chamberPeriod: board.chamberPeriod || '',
                members: board.members && board.members.length > 0 ? board.members : [{ title: '', name: '' }]
            });
        }
    }, [board]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...formData.members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setFormData(prev => ({ ...prev, members: newMembers }));
    };

    const addMemberRow = () => {
        setFormData(prev => ({ ...prev, members: [...prev.members, { title: '', name: '' }] }));
    };

    const removeMemberRow = (index) => {
        const newMembers = formData.members.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, members: newMembers }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBoard(formData);
            onSuccess(t('boardCreated'));
            // Reset form data
            setFormData({
                name: '',
                type: null,
                period: null,
                chamber: null,
                chamberPeriod: '',
                members: [{ title: '', name: '' }]
            });
        } catch (error) {
            console.error(error);
            onError(t('errorSavingBoard'));
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label={t('Board Name')}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            size="small"
                            options={boardTypes}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, value) => setFormData(prev => ({ ...prev, type: value }))}
                            value={formData.type || null}
                            renderInput={(params) => <TextField {...params} label={t("Board Type")} variant="outlined" />}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={t('Chamber Period')}
                            name="chamberPeriod"
                            value={formData.chamberPeriod}
                            onChange={handleInputChange}
                            fullWidth
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            size="small"
                            options={periods}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, value) => setFormData(prev => ({ ...prev, period: value }))}
                            value={formData.period}
                            renderInput={(params) => <TextField {...params} label={t('Period')} variant="outlined" />}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            size="small"
                            options={chambers}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, value) => setFormData(prev => ({ ...prev, chamber: value }))}
                            value={formData.chamber}
                            renderInput={(params) => <TextField {...params} label={t('Chamber')} variant="outlined" />}
                            fullWidth
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid item xs={5}>
                                <h3>{t('Members')}</h3>
                            </Grid>
                            <Grid item xs={7}>
                                <Button onClick={addMemberRow} size='small' startIcon={<AddIcon />} variant="outlined">
                                    {t('Add Member')}
                                </Button>
                            </Grid>
                        </Grid>


                        {formData.members.map((member, index) => (
                            <Grid container spacing={2} alignItems="center" key={index}>
                                <Grid item xs={5} sx={{my:1}}>
                                    <TextField
                                        label={t('Member Title')}
                                        value={member.title}
                                        onChange={(e) => handleMemberChange(index, 'title', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                </Grid>
                                <Grid item xs={6} sx={{my:1}}>
                                    <TextField
                                        label={t('Member Name')}
                                        value={member.name}
                                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                </Grid>
                                <Grid item xs={1} sx={{my:1}}>
                                    <IconButton size='small' onClick={() => removeMemberRow(index)} color="secondary">
                                        <RemoveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                    </Grid>
                    <Grid item xs={12} container justifyContent="flex-end">
                        <Button type="submit" variant="contained" color="primary" >
                            {board ? t('Update Board') : t('Create Board')}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default BoardForm;