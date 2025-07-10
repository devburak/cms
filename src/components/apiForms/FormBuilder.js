import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Paper,
  Grid,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { createForm, updateForm, getFormById } from "../../api";

const emptyField = {
  name: "",
  label: "",
  type: "text",
  required: false,
  unique: false,
  options: [],
  minLength: "",
  maxLength: "",
  minValue: "",
  maxValue: "",
  minChoices: 0,
  maxChoices: "",
  regex: "",
  multiline: false,
  rows: 3,
  htmlContent: "",
  withCheckbox: false,
  groups: null,
  helperText: { text: "", type: "info" },
};

const fieldTypes = [
  "text",
  "number",
  "select",
  "multiselect",
  "radio",
  "date",
  "datetime",
  "html",
];

function FieldEditor({ field, onChange, onDelete }) {
  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ ...field, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={11}>
          <TextField
            label={t("field_name")}
            name="name"
            value={field.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <TextField
            label={t("label")}
            name="label"
            value={field.label}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label={t('helper_text')}
              value={field.helperText?.text || ''}
              onChange={(e) =>
                onChange({
                  ...field,
                  helperText: { ...field.helperText, text: e.target.value },
                })
              }
              fullWidth
            />
            <Select
              value={field.helperText?.type || 'info'}
              onChange={(e) =>
                onChange({
                  ...field,
                  helperText: { ...field.helperText, type: e.target.value },
                })
              }
              sx={{ width: 120 }}
              size="small"
            >
              <MenuItem value="info">{t('info')}</MenuItem>
              <MenuItem value="error">{t('error')}</MenuItem>
            </Select>
          </Box>
          <Select
            name="type"
            value={field.type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
          >
            {fieldTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label={t("groups")}
            value={field.groups ? field.groups.join(",") : ""}
            onChange={(e) => {
              const arr = e.target.value
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g);
              onChange({ ...field, groups: arr.length ? arr : null });
            }}
            fullWidth
            sx={{ mb: 1 }}
          />
          {(field.type === "select" ||
            field.type === "multiselect" ||
            field.type === "radio") && (
            <Box sx={{ mb: 1 }}>
              {field.options.map((opt, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <TextField
                    label={`${t("option")} ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...field.options];
                      opts[i] = e.target.value;
                      onChange({ ...field, options: opts });
                    }}
                    fullWidth
                  />
                  <IconButton
                    onClick={() => {
                      const opts = field.options.filter((_, idx) => idx !== i);
                      onChange({ ...field, options: opts });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                onClick={() =>
                  onChange({ ...field, options: [...field.options, ""] })
                }
              >
                {t("add_option")}
              </Button>
              <Button size="small" component="label" sx={{ ml: 1 }}>
                {t("import_options")}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const text = reader.result;
                      const opts = text
                        .split(";")
                        .map((o) => o.trim())
                        .filter((o) => o);
                      onChange({ ...field, options: opts });
                    };
                    reader.readAsText(file);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Box>
          )}
          {field.type === "text" && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.multiline}
                    onChange={handleChange}
                    name="multiline"
                  />
                }
                label={t("multiline")}
              />
              {field.multiline && (
                <TextField
                  type="number"
                  label={t("rows")}
                  name="rows"
                  value={field.rows}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 1 }}
                />
              )}
            </>
          )}
          {field.type === "html" && (
            <>
              <TextField
                label={t("html_content")}
                name="htmlContent"
                multiline
                value={field.htmlContent}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.withCheckbox}
                    onChange={handleChange}
                    name="withCheckbox"
                  />
                }
                label={t("include_checkbox")}
              />
            </>
          )}
          <TextField
            label={t("regex")}
            name="regex"
            value={field.regex || ""}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={field.required}
                onChange={handleChange}
                name="required"
              />
            }
            label={t("required")}
          />
          {(field.type === "text" ||
            field.type === "number" ||
            field.type === "datetime") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.unique}
                  onChange={handleChange}
                  name="unique"
                />
              }
              label={t("unique")}
            />
          )}
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function FormBuilder({ formId, onSaved }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [fields, setFields] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formId) {
      setLoading(true);
      getFormById(formId)
        .then((data) => {
          const form = data.form || data;
          setName(form.name || "");
          setFields(form.fields || []);
          setSuccessMessage(form.successMessage || "");
          setFailureMessage(form.failureMessage || "");
          setSendEmail(form.sendEmail || false);
          setEmailTo(form.emailTo || "");
        })
        .finally(() => setLoading(false));
    }
  }, [formId]);

  const addField = () =>
    setFields([
      ...fields,
      { ...emptyField, name: `field${fields.length + 1}` },
    ]);
  const updateField = (index, field) => {
    const updated = [...fields];
    updated[index] = field;
    setFields(updated);
  };
  const deleteField = (index) =>
    setFields(fields.filter((_, i) => i !== index));

  const handleSave = async () => {
    const form = {
      name,
      fields,
      successMessage,
      failureMessage,
      sendEmail,
      emailTo,
    };
    if (formId) await updateForm(formId, form);
    else await createForm(form);
    if (onSaved) onSaved();
  };

  // simple drag and drop handlers
  const onDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };
  const onDrop = (e, index) => {
    const from = e.dataTransfer.getData("text/plain");
    if (from === "") return;
    const updated = [...fields];
    const moved = updated.splice(from, 1)[0];
    updated.splice(index, 0, moved);
    setFields(updated);
  };
  const onDragOver = (e) => e.preventDefault();

  return (
    <Box>
      <Backdrop
        open={loading}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <TextField
        label={t("form_name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      {fields.map((f, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={(e) => onDragStart(e, idx)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, idx)}
        >
          <FieldEditor
            field={f}
            onChange={(fld) => updateField(idx, fld)}
            onDelete={() => deleteField(idx)}
          />
        </div>
      ))}
      <TextField
        label={t("success_message")}
        value={successMessage}
        onChange={(e) => setSuccessMessage(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <TextField
        label={t("failure_message")}
        value={failureMessage}
        onChange={(e) => setFailureMessage(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
        }
        label={t("send_email")}
      />
      {sendEmail && (
        <TextField
          label={t("email_to")}
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          fullWidth
          sx={{ mt: 1 }}
        />
      )}
      <Button onClick={addField}>{t("add_field")}</Button>
      <Button variant="contained" onClick={handleSave} sx={{ ml: 2 }}>
        {t("save_form")}
      </Button>
    </Box>
  );
}
