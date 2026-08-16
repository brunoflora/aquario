import { AppStateProvider } from "./state/AppStateProvider.jsx";
import AppShell from "./components/AppShell.jsx";

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
