import { Link } from "react-router-dom";
import { ArrowRight, Filter, Layers, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapImage } from "@/shared/ui/valorant/MapImage";
import { GridPlane } from "@/shared/ui/three/GridPlane";
import { TiltCard } from "@/shared/ui/three/TiltCard";
import { VALORANT_MAPS } from "@/shared/constants/valorant";

const STEPS = [
  {
    icon: ScanLine,
    title: "Subís la captura",
    text: "Mapa, tipo de partida y el scoreboard final. Nada de cargar números a mano.",
  },
  {
    icon: Layers,
    title: "La IA la lee",
    text: "Kills, muertes, asistencias, ACS y composición rival quedan cargados. Vos confirmás el rival.",
  },
  {
    icon: Filter,
    title: "El equipo lo consulta",
    text: "Winrate por mapa, rachas, rivales y la biblioteca de strats, para todo el roster.",
  },
];

export function LandingPage() {
  return (
    <div className="space-y-28 md:space-y-40">
      {/* Hero con el campo 3D detrás */}
      <section className="relative -mt-14 min-h-[78vh] pt-14">
        <div className="absolute inset-x-0 -top-16 -bottom-24 overflow-hidden">
          <GridPlane />
          <div
            className="absolute inset-0 bg-gradient-to-b from-background via-background/0 to-background"
            aria-hidden="true"
          />
        </div>

        <div className="relative flex min-h-[70vh] max-w-3xl flex-col justify-center py-16">
          <p className="eyebrow rise">Análisis de scrims · Valorant</p>
          <h1
            className="rise mt-5 max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight md:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            El historial de tu equipo,
            <span className="text-plasma block">mapa por mapa.</span>
          </h1>
          <p
            className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            Scrimbase convierte la captura del scoreboard en datos del equipo: winrate por mapa, diferencia de
            rondas, rachas y contra quién jugaste. Sin planillas.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild size="lg" className="bg-plasma border-0 text-white hover:opacity-90">
              <Link to="/register">
                Crear equipo
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="space-y-10">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Cómo funciona</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <TiltCard className="surface h-full p-6">
                <div className="layer-lift">
                  <div className="flex items-center justify-between">
                    <span className="bg-plasma flex size-10 items-center justify-center rounded-md text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="num text-3xl text-white/10">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </TiltCard>
            </li>
          ))}
        </ol>
      </section>

      {/* Mapas */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Los doce mapas del pool</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cada partida queda archivada con su mapa, su rival y su composición, lista para filtrar.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {VALORANT_MAPS.map((m, i) => (
            <TiltCard key={m} max={9}>
              <div className="surface relative aspect-[4/3] overflow-hidden">
                <MapImage map={m} variant="strip" className="absolute inset-0" eager={i < 4} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/0" aria-hidden="true" />
                <span className="layer-lift absolute bottom-3 left-3 font-display text-sm font-semibold tracking-wide">
                  {m}
                </span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold">Scrims con filtros</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Buscá por mapa, tipo de partida, resultado, rival o el agente que te tocó enfrentar.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Strats por mapa y lado</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cada setup con su captura, su mapa y si es de ataque o defensa. Una sola referencia para el roster.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Roles del equipo</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Jugadores, coach y manager, con permisos de administración y código de invitación.
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-white/[0.07] pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Scrimbase</span>
        <span>Proyecto independiente, sin relación con Riot Games.</span>
      </footer>
    </div>
  );
}

export default LandingPage;
