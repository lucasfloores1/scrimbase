import { Link } from "react-router-dom";
import { Camera, Map as MapIcon, Target } from "lucide-react";

import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function MockDashboard() {
  const { t } = useI18n();

  const rows = [
    { map: "Icebox", score: "13-11", result: "W" },
    { map: "Bind", score: "8-13", result: "L" },
    { map: "Split", score: "13-9", result: "W" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">{t("dashboard.subtitle")}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.last10")}</div>
        </div>
        <div className="rounded-md bg-brand/10 px-3 py-1 text-xs text-brand">PRO</div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("dashboard.winrate")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">62%</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("dashboard.totalScrims")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">21</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("dashboard.bestMap")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">Ascent</CardContent>
        </Card>
      </div>

      <div className="mt-4 rounded-lg border border-border">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          {t("dashboard.recent")}
        </div>
        <div className="divide-y divide-border">
          {rows.map((s) => (
            <div key={s.map} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="text-foreground">{s.map}</div>
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{s.score}</div>
                <div
                  className={[
                    "w-7 rounded-md px-2 py-0.5 text-center text-xs font-semibold",
                    s.result === "W" ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
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
  const { t } = useI18n();

  const features = [
    { icon: Camera, title: t("landing.feature1"), desc: t("landing.feature1Desc") },
    { icon: MapIcon, title: t("landing.feature2"), desc: t("landing.feature2Desc") },
    { icon: Target, title: t("landing.feature3"), desc: t("landing.feature3Desc") },
  ];

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Valorant · {t("nav.workspace")}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {t("landing.tagline")}
          </h1>

          <p className="text-muted-foreground">{t("landing.subtitle")}</p>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-brand text-brand-foreground hover:bg-brand-hover">
              <Link to="/register">{t("landing.cta")}</Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">{t("landing.pricingNote")}</p>
        </div>

        <MockDashboard />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-5 w-5 text-brand" />
              <CardTitle className="text-base text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Scrimbase</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
