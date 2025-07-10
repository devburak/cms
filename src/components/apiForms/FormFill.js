import React, { useEffect, useState, useMemo } from "react";
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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { getFormById, createSubmission } from "../../api";
import { useParams } from "react-router-dom";

function OptionsField({ field, value, setValue, isRadio, error }) {
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
        </Box>,
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
      />,
    );
  });

  return (
    <Box sx={{ mb: 2 }}>
      {!isRadio && <InputLabel sx={{ mb: 1 }}>{field.label}</InputLabel>}
      {elements}
      {error && <FormHelperText error>{error}</FormHelperText>}
      {field.helperText?.text && (
        <FormHelperText error={field.helperText.type === "error"}>
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
      {error && <FormHelperText error>{error}</FormHelperText>}
      {field.helperText?.text && (
        <FormHelperText error={field.helperText.type === "error"}>
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
          error={Boolean(error)}
          multiline={field.multiline}
          rows={field.multiline ? field.rows || 3 : undefined}
          fullWidth
        />,
      );
    case "number":
      return wrap(
        <TextField
          type="number"
          label={field.label}
          value={value || ""}
          onChange={handleChange}
          required={field.required}
          error={Boolean(error)}
          fullWidth
        />,
      );
    case "select":
      return wrap(
        <FormControl fullWidth error={Boolean(error)}>
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
        </FormControl>,
      );
    case "multiselect":
      return wrap(
        <OptionsField
          field={field}
          value={value}
          setValue={setValue}
          isRadio={false}
          error={error}
        />,
      );
    case "radio":
      return wrap(
        <OptionsField
          field={field}
          value={value}
          setValue={setValue}
          isRadio={true}
          error={error}
        />,
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
          error={Boolean(error)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />,
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
        </Box>,
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
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    getFormById(id).then((data) => setForm(data));
  }, [id]);

  const validateField = (field, val) => {
    if (field.type === "html" && !field.withCheckbox) return "";
    if (field.required) {
      if (
        val === undefined ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        return t("required");
      }
    }
    if (
      val === undefined ||
      val === "" ||
      (Array.isArray(val) && val.length === 0)
    ) {
      return "";
    }
    switch (field.type) {
      case "text": {
        if (field.minLength && val.length < Number(field.minLength)) {
          return t("min_length", { count: field.minLength });
        }
        if (field.maxLength && val.length > Number(field.maxLength)) {
          return t("max_length", { count: field.maxLength });
        }
        if (field.regex) {
          try {
            const r = new RegExp(field.regex);
            if (!r.test(val)) return t("regex_mismatch");
          } catch (e) {
            // ignore regex errors
          }
        }
        break;
      }
      case "number": {
        const num = parseFloat(val);
        if (field.minValue !== "" && num < Number(field.minValue)) {
          return t("min_value", { count: field.minValue });
        }
        if (field.maxValue !== "" && num > Number(field.maxValue)) {
          return t("max_value", { count: field.maxValue });
        }
        break;
      }
      case "multiselect": {
        const arr = val || [];
        if (field.minChoices && arr.length < Number(field.minChoices)) {
          return t("min_choices", { count: field.minChoices });
        }
        if (field.maxChoices !== "" && arr.length > Number(field.maxChoices)) {
          return t("max_choices", { count: field.maxChoices });
        }
        break;
      }
      case "date":
      case "datetime": {
        const dt = new Date(val);
        if (field.minValue && new Date(field.minValue) > dt) {
          return t("min_value", { count: field.minValue });
        }
        if (field.maxValue && new Date(field.maxValue) < dt) {
          return t("max_value", { count: field.maxValue });
        }
        break;
      }
      default:
        break;
    }
    return "";
  };

  const validateFields = (flds) => {
    const err = {};
    flds.forEach((f) => {
      const msg = validateField(f, values[f.name]);
      if (msg) err[f.name] = msg;
    });
    return err;
  };

  const handleSubmit = async () => {
    const err = validateFields(form.fields);
    setErrors(err);
    if (Object.keys(err).length > 0) {
      const first = Object.keys(err)[0];
      const idx = order.findIndex((g) =>
        groupMap[g].some((f) => f.name === first),
      );
      if (idx >= 0) setActiveStep(idx);
      return;
    }

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

  const handleNext = () => {
    const err = validateFields(groupMap[order[activeStep]]);
    if (Object.keys(err).length > 0) {
      setErrors((prev) => ({ ...prev, ...err }));
      return;
    }
    setErrors((prev) => {
      const e = { ...prev };
      groupMap[order[activeStep]].forEach((f) => delete e[f.name]);
      return e;
    });
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setActiveStep((s) => (s > 0 ? s - 1 : s));
  };

  return (
    <Box>
      <h2>{form.name}</h2>
      <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
        {order.map((g) => (
          <Step key={g}>
            <StepLabel>{g === "__ungrouped" ? t("general") : g}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {order.map(
        (g, idx) =>
          idx === activeStep && (
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
          ),
      )}
      {resultMsg && (
        <Alert severity={resultError ? "error" : "success"} sx={{ mb: 2 }}>
          {resultMsg}
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {activeStep > 0 && <Button onClick={handleBack}>{t("back")}</Button>}
        {activeStep < order.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            {t("next")}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            {t("submit")}
          </Button>
        )}
      </Box>
    </Box>
  );
}
