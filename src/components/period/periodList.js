import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, TablePagination, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllPeriods, deletePeriod } from '../../api';

const PeriodList = ({ onEdit }) => {
    const [periods, setPeriods] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchPeriods();
    }, [page, rowsPerPage]);

    const fetchPeriods = async () => {
        try {
            const data = await getAllPeriods(page + 1, rowsPerPage); // Sayfa sayısı 1 tabanlı olduğundan +1 ekliyoruz
            console.log(data)
            setPeriods(data?.periods || []);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch periods:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePeriod(id);
            fetchPeriods(); // Period silindiğinde listeyi güncelle
        } catch (error) {
            console.error("Failed to delete period:", error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {periods.map((period) => (
                            <TableRow key={period._id}>
                                <TableCell>{period.name}</TableCell>
                                <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(period.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => onEdit(period)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleDelete(period._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default PeriodList;
