interface HomeScreenProps {
  activeMenu: string;
  panelClass: string;
}

function HomeScreen({ activeMenu, panelClass }: HomeScreenProps) {
  return (
    <div
      className={`relative w-full max-w-5xl overflow-hidden rounded-2xl border ${panelClass} shadow-2xl`}
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(15, 23, 42, 0.2), rgba(30, 41, 59, 0.6)), url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="flex min-h-[520px] items-center justify-center bg-slate-900/50 p-8 backdrop-blur-[2px]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/35 bg-white/15 text-3xl font-black text-white shadow-xl">
            RH
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Joyería Ruiz Hnos</h1>
          <p className="mt-3 text-sm font-medium text-slate-200 md:text-base">
            Bienvenido. Selecciona una opción desde el menú para comenzar.
          </p>
          <p className="mt-6 inline-flex rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
            Módulo activo: {activeMenu}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
