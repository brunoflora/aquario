import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import { CONFIG_SPEC } from "../../domain/config.js";
import { useAppState } from "../../state/AppStateProvider.jsx";

function Field({ f, value, onChange }) {
  const label = (
    <Stack direction="row" spacing={0.5} component="span" sx={{ alignItems: "center" }}>
      <span>{f.label}</span>
      {f.est && <Chip component="span" size="small" label="EST" />}
      {f.critical && <Chip component="span" size="small" color="error" label="MEDIR" />}
    </Stack>
  );
  return (
    <Grid item xs={12} sm={f.wide ? 12 : 6}>
      <TextField
        fullWidth
        label={label}
        type={f.type === "number" ? "number" : "text"}
        multiline={f.type === "textarea"}
        minRows={f.rows || (f.type === "textarea" ? 2 : undefined)}
        placeholder={f.ph}
        helperText={f.helper}
        value={value === undefined || value === null ? "" : value}
        onChange={(e) => onChange(f.id, e.target.value)}
        inputProps={f.step ? { step: f.step } : undefined}
        InputProps={f.unit ? { endAdornment: <InputAdornment position="end">{f.unit}</InputAdornment> } : undefined}
      />
    </Grid>
  );
}

export default function FichaTecnicaForm() {
  const { state, updateConfig } = useAppState();

  function handleChange(id, value) {
    updateConfig({ [id]: value });
  }

  return (
    <Stack spacing={3}>
      {CONFIG_SPEC.map((section) => (
        <Card key={section.title}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">{section.eyebrow}</Typography>
            <Typography variant="h6" gutterBottom>{section.title}</Typography>
            <Grid container spacing={2}>
              {section.fields.map((f) => (
                <Field key={f.id} f={f} value={state.config[f.id]} onChange={handleChange} />
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
