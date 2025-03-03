// components/chamber/BoardList.js
import React, { useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TableContainer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { getBoards, deleteBoard } from '../../api';

const BoardList = ({ onEdit, onNotify }) => {
  const { t } = useTranslation();
  const [boards, setBoards] = useState([]);

  const fetchBoards = async () => {
    try {
      const result = await getBoards();
      setBoards(result.data);
    } catch (error) {
      onNotify(t('errorLoadingBoards'), 'error');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [onNotify]);

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDeleteBoard'))) {
      try {
        await deleteBoard(id);
        onNotify(t('boardDeleted'));
        fetchBoards();
      } catch (error) {
        onNotify(t('errorDeletingBoard'), 'error');
      }
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Chamber')}</TableCell>
              <TableCell>{t('Name')}</TableCell>
              <TableCell>{t('Period')}</TableCell>
              <TableCell>{t('Members')}</TableCell>
              <TableCell>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map(board => (
              <TableRow key={board._id}>
                <TableCell>{board.chamber?.name}</TableCell>
                <TableCell>{board.name}</TableCell>
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
    </Paper>
  );
};

export default BoardList;