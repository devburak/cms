import React from 'react';
import {
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

function AddressCard({ address, isNew, onEdit, onView, onDelete, onIsUsed }) {
    const { t } = useTranslation();
    return (
        <Card variant="outlined" style={{ width: 200, margin: 10 }}>

            <CardContent>
                {isNew ? (
                    <>
                        <Typography variant="body1" noWrap>

                        </Typography>
                        <IconButton color="primary" size="large">
                            <AddIcon fontSize="large" />
                        </IconButton>
                        <Typography variant="body2" noWrap></Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" noWrap>
                            {address.name}
                        </Typography>
                        <Typography variant="body2" noWrap>
                            {address.fullAddress}
                        </Typography>
                        
                        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                            {
                                address.isUsed ? null : <Tooltip title={t("isUsed")}>
                                    <IconButton size="small" onClick={onIsUsed} aria-label={t("isUsed")}>
                                        <StarIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                            <Tooltip title={t("edit")}>
                                <IconButton size="small" onClick={onEdit}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("view")}>
                                <IconButton size="small" onClick={onView}>
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("delete")}>
                                <IconButton size="small" onClick={onDelete}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default AddressCard;
