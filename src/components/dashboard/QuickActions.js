import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../../context/AuthContext';

const QuickActions = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hasPermission, user } = useAuth();
    const isSuperAdmin = user?.role?.isSuperAdmin === true;

    const actions = [
        {
            label: t('Create Content'),
            icon: <AddIcon />,
            path: '/contents/new',
            show: true // All users can create content (usually)
        },
        {
            label: t('Upload File'),
            icon: <UploadFileIcon />,
            path: '/files',
            show: hasPermission('createFile')
        },
        {
            label: t('Create Event'),
            icon: <EventIcon />,
            path: '/events/new',
            show: hasPermission('createEvent')
        },
        {
            label: t('Create Form'),
            icon: <ListAltIcon />,
            path: '/forms/builder',
            show: hasPermission('createForm')
        },
        {
            label: t('Add User'),
            icon: <PersonAddIcon />,
            path: '/users/new',
            show: hasPermission('createUser')
        },
        {
            label: t('View Logs'),
            icon: <HistoryIcon />,
            path: '/logs',
            show: isSuperAdmin
        }
    ];

    return (
        <Paper sx={{ height: '100%' }}>
            <Box p={2} borderBottom={1} borderColor="divider">
                <Typography variant="h6">{t('Quick Actions')}</Typography>
            </Box>
            <List>
                {actions.filter(action => action.show).map((action, index) => (
                    <ListItem disablePadding key={index}>
                        <ListItemButton onClick={() => navigate(action.path)}>
                            <ListItemIcon>
                                {action.icon}
                            </ListItemIcon>
                            <ListItemText primary={action.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {actions.filter(action => action.show).length === 0 && (
                <Box p={2} textAlign="center">
                    <Typography variant="body2" color="textSecondary">{t('No actions available')}</Typography>
                </Box>
            )}
        </Paper>
    );
};

export default QuickActions;
