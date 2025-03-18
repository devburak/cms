// components/chamber/BoardList.js
import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TableContainer, TablePagination, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { getBoards, deleteBoard } from '../../api';
import debounce from 'lodash.debounce';

const BoardList = ({ onEdit, onNotify }) => {
  const { t } = useTranslation();
  const [boards, setBoards] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const fetchBoards = async (searchTerm = '') => {
    try {
      const result = await getBoards({ page: page + 1, limit, search: searchTerm });
      setBoards(result.data);
      setTotalCount(result.total);
    } catch (error) {
      onNotify(t('errorLoadingBoards'), 'error');
    }
  };

  useEffect(() => {
    fetchBoards(search);
  }, [page, limit, search]);

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeleteBoard'))) {
      try {
        await deleteBoard(id);
        onNotify(t('boardDeleted'));
        fetchBoards(search);
      } catch (error) {
        onNotify(t('errorDeletingBoard'), 'error');
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 300),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TextField
                  label={t('Name')}
                  variant="outlined"
                  size="small"
                  onChange={handleSearchChange}
                  fullWidth
                />
              </TableCell>
              <TableCell>{t('Chamber')}</TableCell>
              <TableCell>{t('Period')}</TableCell>
              <TableCell>{t('Members')}</TableCell>
              <TableCell>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map(board => (
              <TableRow key={board._id}>
                <TableCell>{board.name}</TableCell>
                <TableCell>{board.chamber?.name}</TableCell>
                <TableCell>{board.period && board.period.name}</TableCell>
                <TableCell>
                  {board.members.slice(0, 3).map((member, i) => (
                    <div key={i}>{member.title} - {member.name}</div>
                  ))}
                  {board.members.length > 3 && <div>...</div>}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(board)}>
                    <EditIcon fontSize='small' />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(board._id)}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};

export default BoardList;