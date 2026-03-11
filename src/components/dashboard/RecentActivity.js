import React, { useState } from 'react';
import {
    Paper, Typography, Box, List, ListItem, ListItemText, ListItemAvatar,
    Avatar, Divider, Chip, Tabs, Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import ErrorIcon from '@mui/icons-material/Error';
import moment from 'moment';

const RecentActivity = ({ recentContent, recentUsers, recentErrors, user }) => {
    const { t } = useTranslation();
    const [tabIndex, setTabIndex] = useState(0);
    const isSuperAdmin = user?.role?.isSuperAdmin === true;

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }
        const parsed = moment(date);
        return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : '-';
    };

    return (
        <Paper sx={{ height: '100%' }}>
            <Box p={2} borderBottom={1} borderColor="divider">
                <Typography variant="h6">{t('Recent Activity')}</Typography>
            </Box>

            <Tabs
                value={tabIndex}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
            >
                <Tab icon={<ArticleIcon />} label={t('Content')} />
                {isSuperAdmin && <Tab icon={<ErrorIcon />} label={t('Errors')} />}
                {isSuperAdmin && <Tab icon={<PersonIcon />} label={t('Users')} />}
            </Tabs>

            <Box p={0} flexGrow={1} overflow="auto" maxHeight={400}>
                {/* Recent Content Tab */}
                <div role="tabpanel" hidden={tabIndex !== 0}>
                    {tabIndex === 0 && (
                        <List>
                            {recentContent && recentContent.length > 0 ? (
                                recentContent.map((item, index) => (
                                    <React.Fragment key={item._id || index}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    <ArticleIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={item.title}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            {item.author?.name || t('Unknown')}
                                                        </Typography>
                                                        {` — ${formatDate(item.updatedAt)}`}
                                                    </>
                                                }
                                            />
                                            <Chip
                                                label={t(item.status)}
                                                size="small"
                                                color={item.status === 'published' ? 'success' : 'default'}
                                            />
                                        </ListItem>
                                        {index < recentContent.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Box p={2} textAlign="center">
                                    <Typography variant="body2" color="textSecondary">{t('No recent content')}</Typography>
                                </Box>
                            )}
                        </List>
                    )}
                </div>

                {/* Recent Errors Tab */}
                {isSuperAdmin && (
                    <div role="tabpanel" hidden={tabIndex !== 1}>
                        {tabIndex === 1 && (
                            <List>
                                {recentErrors && recentErrors.length > 0 ? (
                                    recentErrors.map((error, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'error.soft', color: 'error.main' }}>
                                                        <ErrorIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={error.action || t('Unknown Error')}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="error">
                                                                {error.statusCode}
                                                            </Typography>
                                                            {` — ${formatDate(error.timestamp)}`}
                                                            <br />
                                                            <Typography component="span" variant="caption">
                                                                {error.user}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            {index < recentErrors.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Box p={2} textAlign="center">
                                        <Typography variant="body2" color="textSecondary">{t('No recent errors')}</Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </div>
                )}

                {/* Recent Users Tab */}
                {isSuperAdmin && (
                    <div role="tabpanel" hidden={tabIndex !== 2}>
                        {tabIndex === 2 && (
                            <List>
                                {recentUsers && recentUsers.length > 0 ? (
                                    recentUsers.map((user, index) => (
                                        <React.Fragment key={user._id || index}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={user.name || user.email}
                                                    secondary={formatDate(user.lastLogin)}
                                                />
                                                <Chip label={user.role?.name || t('User')} size="small" />
                                            </ListItem>
                                            {index < recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Box p={2} textAlign="center">
                                        <Typography variant="body2" color="textSecondary">{t('No recent users')}</Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </div>
                )}
            </Box>
        </Paper>
    );
};

export default RecentActivity;
