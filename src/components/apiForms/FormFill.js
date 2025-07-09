import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
} from "@mui/material";
import { getFormById, createSubmission } from "../../api";
import { useParams } from "react-router-dom";

function OptionsField({ field, value, setValue, isRadio }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const options = field.options || [];
  const shouldCollapse = options.length > 10;

  const handleCheckbox = (opt, checked) => {
    if (isRadio) {
      if (checked) setValue(opt);
    } else {
      const arr = value ? [...value] : [];
      if (checked) arr.push(opt);
      else arr.splice(arr.indexOf(opt), 1);
      setValue(arr);
    }
  };

  const elements = [];
  options.forEach((opt, idx) => {
    if (idx === 2 && shouldCollapse) {
      elements.push(
        <Box key="toggle" sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ mr: 1 }}>.........</Typography>
          <Button size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? t("hide") : t("show")}
          </Button>
        </Box>
      );
      if (!expanded) return;
    }
    if (!expanded && shouldCollapse && idx >= 2 && idx < options.length - 3) {
      return;
    }
    elements.push(
      <FormControlLabel
        key={opt}
        control={
          <Checkbox
            checked={isRadio ? value === opt : (value || []).includes(opt)}
            onChange={(e) => handleCheckbox(opt, e.target.checked)}
          />
        }
        label={opt}
      />
      );
  });

  return (
    <Box sx={{ mb: 2 }}>
      {!isRadio && <InputLabel sx={{ mb: 1 }}>{field.label}</InputLabel>}
      {elements}
      {field.helperText?.text && (
        <FormHelperText error={field.helperText.type === 'error'}>
          {field.helperText.text}
        </FormHelperText>
      )}
    </Box>
  );
}

function replacePlaceholders(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
}

function renderField(field, value, setValue, error) {
  const handleChange = (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValue(val);
  };

  const wrap = (element) => (
    <Box sx={{ mb: 2 }}>
      {element}
      {field.helperText?.text && (
        <FormHelperText error={field.helperText.type === 'error'}>
          {field.helperText.text}
        </FormHelperText>
      )}
    </Box>
  );

  switch (field.type) {
    case "text":
      return wrap(
        <TextField
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          multiline={field.multiline}
          rows={field.multiline ? field.rows || 3 : undefined}
          fullWidth
        />
      );
    case "number":
      return wrap(
        <TextField
          type="number"
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          fullWidth
        />
      );
    case "select":
      return wrap(
        <FormControl fullWidth error={error}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value || ""}
            label={field.label}
            onChange={handleChange}
            required={field.required}
          >
            {field.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "multiselect":
      return wrap(
        <OptionsField
          field={field}
          value={value}
          setValue={setValue}
          isRadio={false}
        />
      );
    case "radio":
      return wrap(
        <OptionsField
          field={field}
          value={value}
          setValue={setValue}
          isRadio={true}
        />
      );
    case "date":
    case "datetime":
      return wrap(
        <TextField
          type="date"
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      );
    case "html":
      return wrap(
        <Box>
          {field.htmlContent && (
            <div dangerouslySetInnerHTML={{ __html: field.htmlContent }} />
          )}
          {field.withCheckbox && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value || false}
                  onChange={handleChange}
                  required={field.required}
                />
              }
              label={field.label}
            />
          )}
        </Box>
      );
    default:
      return null;
  }
}

export default function FormFill() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);

  useEffect(() => {
    getFormById(id).then((data) => setForm(data));
  }, [id]);

  const handleSubmit = async () => {
    const err = {};
    form.fields.forEach((f) => {
      if (f.required && !(f.type === "html" && !f.withCheckbox)) {
        const val = values[f.name];
        if (
          val === undefined ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          err[f.name] = true;
        }
      }
    });
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    try {
      const submitValues = { ...values };
      form.fields.forEach((f) => {
        if (f.type === "multiselect") {
          // Backend expects an array for multiselect fields
          submitValues[f.name] = values[f.name] || [];
        }
        if (f.type === "html" && !f.withCheckbox) {
          delete submitValues[f.name];
        }
      });
      await createSubmission(id, submitValues);
      const msg = form.successMessage || t("submitted");
      setResultMsg(replacePlaceholders(msg, submitValues));
      setResultError(false);
    } catch (e) {
      const msg = form.failureMessage || t("submission_failed");
      setResultMsg(
        replacePlaceholders(msg, values) + (e?.message ? `: ${e.message}` : ""),
      );
      setResultError(true);
    }
  };

  if (!form) return null;

  const groupMap = {};
  const order = [];
  form.fields.forEach((f) => {
    let groups =
      Array.isArray(f.groups) && f.groups.length ? f.groups : ["__ungrouped"];
    groups.forEach((g) => {
      if (!groupMap[g]) {
        groupMap[g] = [];
        order.push(g);
      }
      groupMap[g].push(f);
    });
  });

  return (
    <Box>
      <h2>{form.name}</h2>
      {order.map((g) => (
        <Box key={g} sx={{ mb: 2 }}>
          {g !== "__ungrouped" && <h3>{g}</h3>}
          {groupMap[g].map((f) => {
            const value = values[f.name];
            return (
              <div key={`${g}-${f.name}`}>
                {renderField(
                  f,
                  value,
                  (val) => setValues({ ...values, [f.name]: val }),
                  errors[f.name],
                )}
              </div>
            );
          })}
        </Box>
      ))}
      {resultMsg && (
        <Alert severity={resultError ? "error" : "success"} sx={{ mb: 2 }}>
          {resultMsg}
        </Alert>
      )}
      <Button variant="contained" onClick={handleSubmit}>
        {t("submit")}
      </Button>
    </Box>
  );
}
