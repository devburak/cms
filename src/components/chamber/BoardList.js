import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
  TablePagination,
  TextField,
  Stack,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import {
  getBoards,
  deleteBoard,
  getAllChambers,
  getAllBoardTypes,
} from "../../api";

const BoardList = ({ onEdit, onNotify, refreshKey = 0 }) => {
  const { t } = useTranslation();
  const [boards, setBoards] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [chamber, setChamber] = useState("");
  const [type, setType] = useState("");
  const [chambers, setChambers] = useState([]);
  const [types, setTypes] = useState([]);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getAllChambers(), getAllBoardTypes()])
      .then(([rooms, kinds]) => {
        if (active) {
          setChambers(rooms.data || []);
          setTypes(kinds || []);
        }
      })
      .catch(() => {
        if (active) setError("Oda ve kurul türleri yüklenemedi.");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    let active = true;
    getBoards({
      page: page + 1,
      limit,
      search,
      ...(chamber && { chamber }),
      ...(type && { type }),
    })
      .then((result) => {
        if (active) {
          setBoards(result.data);
          setTotalCount(result.total);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setBoards([]);
          setTotalCount(0);
          setError("Kurullar yüklenemedi.");
        }
      });
    return () => {
      active = false;
    };
  }, [page, limit, search, chamber, type, reload, refreshKey]);
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteBoard"))) return;
    try {
      await deleteBoard(id);
      onNotify(t("boardDeleted"));
      if (boards.length === 1 && page > 0) setPage(page - 1);
      else setReload((value) => value + 1);
    } catch {
      onNotify(t("errorDeletingBoard"), "error");
    }
  };
  return (
    <Paper>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 2 }}>
        <TextField
          label={t("Name")}
          size="small"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          select
          label="Oda"
          size="small"
          value={chamber}
          onChange={(event) => {
            setChamber(event.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {chambers.map((item) => (
            <MenuItem key={item._id} value={item._id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Kurul türü"
          size="small"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {types.map((item) => (
            <MenuItem key={item._id} value={item._id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {error && <p role="alert">{error}</p>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {["Name", "Chamber", "Oda dönemi", "Members", "Actions"].map(
                (label) => (
                  <TableCell key={label}>{t(label)}</TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map((board) => (
              <TableRow key={board._id}>
                <TableCell>{board.name}</TableCell>
                <TableCell>{board.chamber?.name}</TableCell>
                <TableCell>
                  {board.term?.name ||
                    board.chamberPeriod ||
                    "Dönem belirtilmemiş"}
                  {(board.term?.startDate || board.term?.endDate) && (
                    <div>
                      {board.term?.startDate?.slice(0, 10) || "…"} –{" "}
                      {board.term?.endDate?.slice(0, 10) || "…"}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {(board.members || []).slice(0, 3).map((member, i) => (
                    <div key={i}>
                      {member.title} - {member.name}
                    </div>
                  ))}
                  {board.members?.length > 3 && <div>...</div>}
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="Kurulu düzenle"
                    onClick={() => onEdit(board)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Kurulu sil"
                    onClick={() => handleDelete(board._id)}
                  >
                    <DeleteIcon fontSize="small" />
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
        onPageChange={(_, value) => setPage(value)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => {
          setLimit(Number(event.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
};
export default BoardList;
