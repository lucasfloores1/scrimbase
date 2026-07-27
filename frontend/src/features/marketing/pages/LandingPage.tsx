import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


function MockDashboard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">
            Resumen del equipo
          </div>
          <div className="text-xs text-slate-400">Últimos 7 días</div>
        </div>
        <div className="rounded-md bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
          Activo
        </div>
      </div>

      <Separator className="my-4 bg-slate-800" />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">
              Porcentaje de victorias
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-200">
            62%
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">
              Scrims jugadas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-200">
            21
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">
              Mejor mapa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-200">
            Ascent
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/30">
        <div className="px-3 py-2 text-xs font-medium text-slate-400">
          Últimas scrims
        </div>
        <div className="divide-y divide-slate-800">
          {[
            { map: "Icebox", score: "13-11", result: "W" },
            { map: "Bind", score: "8-13", result: "L" },
            { map: "Split", score: "13-9", result: "W" },
          ].map((s) => (
            <div
              key={s.map}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <div className="text-slate-200">{s.map}</div>
              <div className="flex items-center gap-3">
                <div className="text-slate-300">{s.score}</div>
                <div
                  className={[
                    "w-7 rounded-md px-2 py-0.5 text-center text-xs font-semibold",
                    s.result === "W"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300",
                  ].join(" ")}
                >
                  {s.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="space-y-14">
      {/* HERO SECTION */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-slate-300">
            Diseñado para el entrenamiento diario
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-100 md:text-5xl">
            Entrena mejor con scrims, estrategias y análisis de equipo.
          </h1>

          <p className="text-slate-400">
            Scrimbase ayuda a coaches y jugadores a organizar la práctica
            diaria: sube scrims, guarda estrategias y analiza el rendimiento
            de tu equipo de forma clara y estructurada.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/register">Crear equipo</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-slate-800 bg-slate-950"
            >
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>

        <MockDashboard />
      </section>

      {/* FEATURES SECTION */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-base text-slate-300" >
              Scrims organizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            Guarda resultados y filtra por mapa, rival y fecha para analizar
            el rendimiento del equipo.
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-base text-slate-300">
              Biblioteca de estrategias
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            Centraliza tus estrategias por mapa y mantén la práctica
            consistente y repetible.
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-base text-slate-300">
              Gestión del equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            Controla roles, permisos y mantén una estructura clara para el
            trabajo diario del equipo.
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Scrimbase</div>
          <div className="flex gap-4">
            <span className="text-slate-600">Privacidad</span>
            <span className="text-slate-600">Términos</span>
            <span className="text-slate-600">Contacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;