import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

export default function CloudCard({ cloud }) {
  const [url, setUrl] = useState(cloud.cfg?.url || "");
  const [key, setKey] = useState(cloud.cfg?.key || "");

  return (
    <Card id="aq-cloud-card">
      <CardContent>
        <Typography variant="overline" color="text.secondary">Onde os dados ficam salvos</Typography>
        <Typography variant="h6" gutterBottom>Sincronização na nuvem</Typography>

        {cloud.sandboxed && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta é a página publicada no claude.ai — ela roda dentro de um sandbox que bloqueia qualquer conexão
            de rede, então a sincronização abaixo nunca vai funcionar aqui, com ou sem projeto configurado. Para
            sincronizar de verdade entre aparelhos, publique este site (GitHub Pages/Vercel/Netlify) — aí a
            conexão com o Supabase funciona normalmente.
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, opacity: cloud.sandboxed ? 0.6 : 1 }}>
          Sem configurar nada abaixo, os dados ficam apenas neste navegador (localStorage) — não somem, mas
          também não aparecem em outro aparelho. Preencha os dois campos de um projeto{" "}
          <Link href="https://supabase.com" target="_blank" rel="noopener">Supabase</Link> gratuito para os
          mesmos dados aparecerem em qualquer dispositivo que abrir esta página com as mesmas credenciais.
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            label="URL do projeto Supabase"
            placeholder="https://xxxxxxxxxxxx.supabase.co"
            value={url} onChange={(e) => setUrl(e.target.value)}
            helperText='Em Project Settings → API, campo "Project URL".'
            autoComplete="off"
          />
          <TextField
            label="Chave anon/public" type="password"
            placeholder="eyJhbGciOi..."
            value={key} onChange={(e) => setKey(e.target.value)}
            helperText={<>Mesma tela, campo "anon public". <strong>Nunca use a "service_role"</strong> aqui — ela tem acesso total e não deve rodar no navegador.</>}
            autoComplete="off"
          />
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => cloud.saveCloudConfig(url, key)}>Salvar e conectar</Button>
            <Button variant="outlined" onClick={cloud.manualSync}>Sincronizar agora</Button>
            <Button variant="outlined" color="error" onClick={() => { cloud.disconnectCloud(); setUrl(""); setKey(""); }}>Desconectar</Button>
            {cloud.cloudDetail && <Typography variant="caption" color="text.secondary">{cloud.cloudDetail}</Typography>}
          </Stack>
        </Stack>

        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          <strong>Modelo de confiança:</strong> a chave anon fica salva só no localStorage deste navegador, nunca
          entra no "Exportar JSON". Mas ela não é secreta como uma senha — qualquer pessoa com a URL e a chave lê
          e escreve nesses dados, do mesmo jeito que um link do Google Sheets "qualquer pessoa com o link pode
          editar". Trate as duas como um link privado, não como uma senha forte.
        </Alert>
      </CardContent>
    </Card>
  );
}
