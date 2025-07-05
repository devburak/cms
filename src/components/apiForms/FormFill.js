import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from "@mui/material";
import { getFormById, createSubmission } from "../../api";
import { useParams } from "react-router-dom";

function replacePlaceholders(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
}

function renderField(field, value, setValue, error) {
  const handleChange = (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValue(val);
  };

  switch (field.type) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          multiline={field.multiline}
          rows={field.multiline ? field.rows || 3 : undefined}
          fullWidth
          sx={{ mb: 2 }}
        />
      );
    case "number":
      return (
        <TextField
          type="number"
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          fullWidth
          sx={{ mb: 2 }}
        />
      );
    case "select":
      return (
        <Select
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          fullWidth
          sx={{ mb: 2 }}
          error={error}
        >
          {field.options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      );
    case "multiselect":
      return (
        <Select
          multiple
          value={value || []}
          onChange={handleChange}
          required={field.required}
          fullWidth
          sx={{ mb: 2 }}
          error={error}
        >
          {field.options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      );
    case "radio":
      return (
        <Box sx={{ mb: 2 }}>
          {field.options.map((opt) => (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={value === opt}
                  onChange={() => setValue(opt)}
                />
              }
              label={opt}
            />
          ))}
        </Box>
      );
    case "date":
    case "datetime":
      return (
        <TextField
          type="date"
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          fullWidth
          sx={{ mb: 2 }}
        />
      );
    case "html":
      return (
        <TextField
          multiline
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={error}
          fullWidth
          sx={{ mb: 2 }}
        />
      );
    default:
      return null;
  }
}

export default function FormFill() {
  const { id } = useParams();
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
      if (f.required) {
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
      await createSubmission(id, values);
      const msg = form.successMessage || "Submitted";
      setResultMsg(replacePlaceholders(msg, values));
      setResultError(false);
    } catch (e) {
      const msg = form.failureMessage || "Submission failed";
      setResultMsg(
        replacePlaceholders(msg, values) + (e?.message ? `: ${e.message}` : ""),
      );
      setResultError(true);
    }
  };

  if (!form) return null;

  return (
    <Box>
      <h2>{form.name}</h2>
      {form.fields.map((f) => {
        const value = values[f.name];
        return (
          <div key={f.name}>
            {renderField(
              f,
              value,
              (val) => setValues({ ...values, [f.name]: val }),
              errors[f.name],
            )}
          </div>
        );
      })}
      {resultMsg && (
        <Alert severity={resultError ? "error" : "success"} sx={{ mb: 2 }}>
          {resultMsg}
        </Alert>
      )}
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}
