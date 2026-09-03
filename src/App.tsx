import { AppProvider, useApp } from "./store";
import { BgFx, TabBar, TopBar } from "./components/chrome";
import { Home } from "./views/Home";
import { Studio } from "./views/Studio";
import { Skaters } from "./views/Skaters";
import { Season } from "./views/Season";
import { JudgesBoard } from "./views/Judges";
import { Profile } from "./views/Profile";

function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast glass glass-strong ${toast ? "show" : ""}`} key={toast?.id ?? 0}>
      {toast?.msg ?? ""}
    </div>
  );
}

function Shell() {
  const { view } = useApp();
  return (
    <>
      <BgFx />
      <div className="app-shell">
        <TopBar />
        <main key={view} className="view" style={{ paddingBottom: view === "studio" ? 210 : undefined }}>
          {view === "home" && <Home />}
          {view === "studio" && <Studio />}
          {view === "skaters" && <Skaters />}
          {view === "season" && <Season />}
          {view === "judges" && <JudgesBoard />}
          {view === "profile" && <Profile />}
        </main>
      </div>
      <TabBar />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
