// components/chamber/BoardForm.js
import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import {
  getBoardTerms,
  getAllChambers,
  getAllBoardTypes,
  createBoard,
  updateBoard,
} from "../../api";

const toSortWeight = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const sortBoardTypesByWeight = (items = []) =>
  [...items].sort((left, right) => {
    const leftWeight = toSortWeight(left?.sortWeight);
    const rightWeight = toSortWeight(right?.sortWeight);

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return String(left?.name || "").localeCompare(
      String(right?.name || ""),
      "tr",
      { sensitivity: "base" },
    );
  });

const BoardForm = ({ board, onSuccess, onError }) => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState([]);
  const [termError, setTermError] = useState("");
  const [chambers, setChambers] = useState([]);
  const [boardTypes, setBoardTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    isArchived: false,
    type: null,
    chamber: null,
    term: { name: "", startDate: "", endDate: "" },
    members: [{ title: "", name: "" }],
  });

  useEffect(() => {
    const fetchChambers = async () => {
      try {
        const chambersData = await getAllChambers();
        setChambers(chambersData.data || []);
      } catch (error) {
        console.error("Error fetching chambers:", error);
      }
    };
    const fetchBoardTypes = async () => {
      try {
        const data = await getAllBoardTypes();
        setBoardTypes(sortBoardTypesByWeight(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error fetching board types:", error);
      }
    };
    fetchBoardTypes();
    fetchChambers();

    if (board) {
      setFormData({
        name: board.name,
        isArchived: Boolean(board.isArchived),
        type: board.type || null,
        chamber: board.chamber || null,
        term: {
          name: board.term?.name || board.chamberPeriod || "",
          startDate: board.term?.startDate?.slice(0, 10) || "",
          endDate: board.term?.endDate?.slice(0, 10) || "",
        },
        members: Array.isArray(board.members) ? board.members : [],
      });
    }
  }, [board]);

  useEffect(() => {
    let active = true;
    setTerms([]);
    setTermError("");
    if (formData.chamber?._id) {
      getBoardTerms(formData.chamber._id)
        .then((result) => {
          if (active) setTerms(result.data || []);
        })
        .catch(() => {
          if (active)
            setTermError(
              "Oda dönemi önerileri yüklenemedi. Dönem adını elle girebilirsiniz.",
            );
        });
    }
    return () => {
      active = false;
    };
  }, [formData.chamber?._id]);

  const selectTerm = (name) => {
    const found = terms.find((term) => term.name === name);
    setFormData((prev) => ({
      ...prev,
      term: {
        name,
        startDate: found?.startDate?.slice(0, 10) || "",
        endDate: found?.endDate?.slice(0, 10) || "",
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const addMemberRow = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { title: "", name: "" }],
    }));
  };

  const removeMemberRow = (index) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { term } = formData;
      if (term.startDate && term.endDate && term.startDate > term.endDate) {
        onError("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
        return;
      }
      const payload = {
        ...formData,
        type: formData.type?._id,
        chamber: formData.chamber?._id,
        term: {
          name: term.name.trim(),
          startDate: term.startDate || null,
          endDate: term.endDate || null,
        },
      };
      if (board && board._id) {
        await updateBoard(board._id, payload);
        onSuccess(t("boardUpdated"));
      } else {
        await createBoard(payload);
        onSuccess(t("boardCreated"));
      }
      // Reset form data
      setFormData({
        name: "",
        isArchived: false,
        type: null,
        chamber: null,
        term: { name: "", startDate: "", endDate: "" },
        members: [{ title: "", name: "" }],
      });
    } catch (error) {
      console.error(error);
      onError(error.response?.data?.error || t("errorSavingBoard"));
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(formData.isArchived)}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      isArchived: event.target.checked,
                    }))
                  }
                />
              }
              label="Yalnız geçmiş kurullarda göster"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("Board Name")}
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
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(e, value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
              value={formData.type || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Board Type")}
                  required
                  variant="outlined"
                />
              )}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              size="small"
              options={chambers}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(e, value) =>
                setFormData((prev) => ({
                  ...prev,
                  chamber: value,
                  term: { name: "", startDate: "", endDate: "" },
                }))
              }
              value={formData.chamber}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Chamber")}
                  required
                  variant="outlined"
                />
              )}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={terms.map((term) => term.name)}
              inputValue={formData.term.name}
              onInputChange={(_, value, reason) => {
                if (reason === "input" || reason === "clear")
                  setFormData((prev) => ({
                    ...prev,
                    term: { ...prev.term, name: value },
                  }));
              }}
              onChange={(_, value) => selectTerm(value || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Oda dönemi (isteğe bağlı)"
                  inputProps={{ ...params.inputProps, maxLength: 120 }}
                  helperText="Örnek: 49. Serbest metindir; TMMOB döneminden bağımsızdır. Ad ve tarihler boş bırakılabilir."
                />
              )}
            />
          </Grid>
          {termError && (
            <Grid item xs={12}>
              <Alert severity="warning">{termError}</Alert>
            </Grid>
          )}
          {terms.find((term) => term.name === formData.term.name)
            ?.datesConflicted && (
            <Grid item xs={12}>
              <Alert severity="warning">
                Bu döneme ait kayıtların tarihleri farklı. Doğrulanmış tarihleri
                elle girin.
              </Alert>
            </Grid>
          )}
          {board && !board.term?.name && !board.chamberPeriod && (
            <Grid item xs={12}>
              <Alert severity="info">
                Bu eski kayıt dönem belirtilmemiş arşivinde görünür. Üyeleri
                dönem eklemeden düzenleyebilirsiniz.
              </Alert>
            </Grid>
          )}
          {["startDate", "endDate"].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                type="date"
                label={
                  field === "startDate"
                    ? "Başlangıç tarihi (isteğe bağlı)"
                    : "Bitiş tarihi (isteğe bağlı)"
                }
                InputLabelProps={{ shrink: true }}
                value={formData.term[field]}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    term: { ...prev.term, [field]: event.target.value },
                  }))
                }
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Grid container spacing={2} alignItems={"center"}>
              <Grid item xs={5}>
                <h3>{t("Members")}</h3>
              </Grid>
              <Grid item xs={7}>
                <Button
                  onClick={addMemberRow}
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                >
                  {t("Add Member")}
                </Button>
              </Grid>
            </Grid>

            {formData.members.map((member, index) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid item xs={5} sx={{ my: 1 }}>
                  <TextField
                    label={t("Member Title")}
                    value={member.title || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "title", e.target.value)
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sx={{ my: 1 }}>
                  <TextField
                    label={t("Member Name")}
                    required
                    value={member.name || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "name", e.target.value)
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={1} sx={{ my: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => removeMemberRow(index)}
                    color="secondary"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} container justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">
              {board ? t("Update Board") : t("Create Board")}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BoardForm;
