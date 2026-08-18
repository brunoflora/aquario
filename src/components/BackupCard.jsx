import { useRef } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useAppState } from "../state/AppStateProvider.jsx";
import { todayStr } from "../domain/format.js";
import { Panel } from "./ui.jsx";

export default function BackupCard() {
  const { state, exportPayload, importData, showSnackbar } = useAppState();
  const fileInputRef = useRef(null);

  function handleExport() {
    const payload = exportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aquario-ciclideos-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSnackbar("Backup exportado.", { variant: "success" });
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.readings)) {
          showSnackbar(
            'Este arquivo não parece um backup do painel: falta a lista "readings". Use um arquivo gerado pelo próprio botão Exportar.',
            { variant: "error" }
          );
        } else {
          const summary = `${data.readings.length} leitura(s)`
            + (Array.isArray(data.structTasks) ? `, ${data.structTasks.length} ação(ões)` : "")
            + (data.config ? ", ficha do sistema" : "");
          const ok = window.confirm(
            `Importar ${summary}.\n\nIsto substitui os ${state.readings.length} registro(s) atuais deste navegador.\nVocê poderá desfazer logo em seguida.`
          );
          if (ok) importData(data, summary);
        }
      } catch (err) {
        showSnackbar(`Não foi possível ler o arquivo — não é um JSON válido. Detalhe: ${err.message}`, { variant: "error" });
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <Panel>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Os dados vivem neste navegador. O backup em arquivo é o que sobrevive a
        trocar de celular ou limpar o histórico.
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth variant="outlined" color="inherit"
          startIcon={<FileDownloadIcon />} onClick={handleExport}
        >
          Exportar
        </Button>
        <Button
          fullWidth variant="outlined" color="inherit"
          startIcon={<FileUploadIcon />} onClick={() => fileInputRef.current?.click()}
        >
          Importar
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
      </Stack>
    </Panel>
  );
}
