import { useMemo, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import SalesScreen from "./screens/SalesScreen";

const menuItems = [
  "Inicio",
  "Ventas",
  "Productos",
  "Clientes",
  "Usuarios",
  "Consultas",
  "Reportes",
  "Configuración"
] as const;

type MenuItem = (typeof menuItems)[number];

function App() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("Inicio");

  const theme = useMemo(
    () => ({
      shell: darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900",
      topBar: darkMode
        ? "border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800"
        : "border-sky-700 bg-gradient-to-r from-sky-800 to-blue-700",
      panel: darkMode ? "border-slate-800 bg-slate-900/95" : "border-slate-200 bg-white/95",
      subPanel: darkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white/70",
      textMuted: darkMode ? "text-slate-400" : "text-slate-500",
      itemIdle: darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100",
      itemActive: darkMode ? "bg-cyan-900/70 text-cyan-100" : "bg-sky-100 text-sky-900",
      overlay: darkMode ? "bg-black/55" : "bg-slate-900/35"
    }),
    [darkMode]
  );

  function renderActiveScreen() {
    if (activeMenu === "Ventas") {
      return <SalesScreen darkMode={darkMode} />;
    }

    return <HomeScreen activeMenu={activeMenu} panelClass={theme.panel} />;
  }

  return (
    <main className={`min-h-screen ${theme.shell}`}>
      <header className={`sticky top-0 z-40 border-b px-4 py-3 text-white ${theme.topBar}`}>
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
              aria-label="Abrir menu"
            >
              <HamburgerIcon />
            </button>
            <div>
              <p className="text-lg font-semibold leading-tight">Joyería Ruiz Hnos</p>
              <p className="text-xs text-cyan-100/90">POS web multiplataforma</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-screen-2xl">
        {menuOpen && (
          <button
            aria-label="Cerrar menu"
            className={`fixed inset-0 z-20 lg:hidden ${theme.overlay}`}
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed bottom-0 left-0 top-[65px] z-30 w-[290px] transform border-r p-4 transition duration-200 lg:static lg:top-0 lg:block lg:translate-x-0 ${theme.panel} ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className={`mb-4 rounded-xl border p-4 ${theme.subPanel}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-lg font-bold text-slate-900">
                RH
              </div>
              <div>
                <p className="text-sm font-semibold">Joyería Ruiz Hnos</p>
                <p className={`text-xs ${theme.textMuted}`}>México</p>
                <p className={`text-xs ${theme.textMuted}`}>Caja 1</p>
              </div>
            </div>
          </div>

          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu(item);
                      if (window.innerWidth < 1024) {
                        setMenuOpen(false);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      activeMenu === item ? theme.itemActive : theme.itemIdle
                    }`}
                  >
                    <MenuDot />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="flex min-h-[calc(100vh-65px)] flex-1 items-center justify-center px-4 py-6 lg:px-8">
          {renderActiveScreen()}
        </section>
      </div>
    </main>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MenuDot() {
  return <span className="h-2 w-2 rounded-full bg-current opacity-75" />;
}

export default App;
