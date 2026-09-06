import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MarketingNavbar } from "@/shared/ui/components/MarketingNavbar";
import { ArrowRight } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-white">
        <div className="scrim-grid absolute inset-0 opacity-50" />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 70% 20%, rgba(184,242,41,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(255,255,255,0.06), transparent 50%)",
          }}
        />

        <MarketingNavbar />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-20">
          <div className="max-w-3xl space-y-6 animate-rise">
            <p className="font-display text-[clamp(3.5rem,12vw,8.5rem)] font-semibold leading-[0.9] tracking-tight">
              Scrimbase
            </p>
            <p className="max-w-md text-base text-white/60 md:text-lg text-pretty">
              The practice OS for Valorant teams — capture scoreboards, review stats, keep strats in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-signal text-signal-foreground hover:bg-signal/90 gap-2">
                <Link to="/register">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-3 md:px-6 md:py-28">
          {[
            {
              title: "AI capture",
              body: "Upload a scoreboard. We draft rounds, agents and player stats in seconds.",
            },
            {
              title: "Team memory",
              body: "Every scrim and strat stays searchable for your roster — not buried in Discord.",
            },
            {
              title: "Clear signals",
              body: "Winrate, best maps and recent form — enough to coach, not enough to drown in.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={i === 0 ? "animate-rise" : i === 1 ? "animate-rise-delay" : "animate-rise-delay-2"}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                0{i + 1}
              </p>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 md:px-6">
          <span className="font-display text-sm font-semibold">Scrimbase</span>
          <span className="text-xs text-muted-foreground">Built for competitive teams</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
