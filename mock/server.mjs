/**
 * Mock de la API de Scrimbase para desarrollar el frontend sin Mongo ni Gemini.
 *
 * Replica el contrato real del backend (NestJS):
 *  - prefijo /api, envelope { success, data, error, meta }
 *  - errores { statusCode, message, details? }
 *  - mismas reglas de validación que los DTOs (CreateTeamDto, CreateScrimDto, etc.)
 *  - TeamFullGuard: 5 miembros para subir scrims
 *  - archivos en /uploads como ServeStaticModule
 *
 * Uso:  npm run mock   (puerto 3000)
 * Cuenta seed: admin@scrimbase.gg / password  (equipo "Rosario Esports" #ROS con 5 miembros)
 */
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.MOCK_PORT ?? 3000);
const UPLOADS = path.join(__dirname, "uploads");
const PARSE_DELAY_MS = Number(process.env.MOCK_PARSE_DELAY ?? 900);
fs.mkdirSync(path.join(UPLOADS, "scrims"), { recursive: true });
fs.mkdirSync(path.join(UPLOADS, "strats"), { recursive: true });

// ---------- helpers ----------
const oid = () => crypto.randomBytes(12).toString("hex");
const isOid = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);
const now = () => new Date().toISOString();
const round1 = (n) => Math.round(n * 10) / 10;

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
const bad = (msg, details) => new HttpError(400, msg, details);

function ok(res, data, status = 200) {
  res.status(status).json({ success: true, data: data ?? null, error: null, meta: { timestamp: now() } });
}

function parseRiotId(input) {
  const trimmed = String(input ?? "").trim();
  const parts = trimmed.split("#");
  if (parts.length !== 2) return null;
  const [name, tag] = parts;
  if (!name?.trim() || !tag?.trim()) return null;
  if (tag.length < 3 || tag.length > 5) return null;
  return { riotId: trimmed, riotIdNormalized: trimmed.toLowerCase() };
}

const MAPS = ["Ascent","Bind","Breeze","Fracture","Haven","Icebox","Lotus","Pearl","Split","Sunset","Abyss","Corrode"];
const AGENTS = ["Astra","Breach","Brimstone","Chamber","Clove","Cypher","Deadlock","Fade","Gekko","Harbor","Iso","Jett","KAY/O","Killjoy","Miks","Neon","Omen","Phoenix","Raze","Reyna","Sage","Skye","Sova","Tejo","Veto","Viper","Vyse","Waylay","Yoru"];
const AGENTS_WITH_UNKNOWN = [...AGENTS, "UNKNOWN"];
const SIDES = ["ATTACK", "DEFENSE"];

// ---------- "DB" ----------
const db = { users: [], teams: [], members: [], scrims: [], strats: [], refresh: new Map() };

function seed() {
  const teamId = oid();
  const names = [
    ["admin@scrimbase.gg", "davidc", "DavidC#ROS", "MANAGER", true],
    ["coach@scrimbase.gg", "lucasf", "lucasf#COACH", "COACH", false],
    ["p1@scrimbase.gg", "nacho", "Nacho#1234", "PLAYER", false],
    ["p2@scrimbase.gg", "mili", "Mili#LAS", "PLAYER", false],
    ["p3@scrimbase.gg", "tomi", "Tomi#777", "PLAYER", false],
  ];
  for (const [email, username, riotId, role, isAdmin] of names) {
    const u = { id: oid(), email, username, password: "password", riotId, altAccountId: undefined, createdAt: now() };
    db.users.push(u);
    db.members.push({ id: oid(), userId: u.id, teamId, role, isAdmin, joinedAt: new Date(Date.now() - 40 * 864e5).toISOString() });
  }
  db.teams.push({ id: teamId, name: "Rosario Esports", tag: "ROS", createdBy: db.users[0].id, inviteCode: "8f0XFGODBoup", createdAt: now() });

  const agentsPool = ["Jett", "Omen", "Sova", "Killjoy", "KAY/O", "Raze", "Viper", "Cypher", "Fade", "Skye", "Tejo", "Vyse"];
  const rivals = ["Nova Esports", "KRÜ Academy", "Leviatán B", "Furious Gaming", "Boca Juniors Gaming"];
  const results = [
    ["Ascent", "SCRIM", 13, 9], ["Lotus", "SCRIM", 11, 13], ["Bind", "PREMIER", 13, 6], ["Sunset", "SCRIM", 13, 11],
    ["Haven", "TOURNAMENT", 8, 13], ["Ascent", "SCRIM", 13, 4], ["Split", "SCRIM", 14, 16], ["Icebox", "SCRIM", 13, 10],
    ["Corrode", "SCRIM", 12, 12], ["Bind", "SCRIM", 13, 7], ["Abyss", "PREMIER", 9, 13], ["Ascent", "SCRIM", 13, 11],
    ["Lotus", "SCRIM", 13, 8], ["Pearl", "SCRIM", 6, 13],
  ];
  const players = db.users.filter((u) => u.username !== "lucasf");
  results.forEach(([map, type, tr, er], i) => {
    const teamStats = players.map((u, j) => ({
      userId: u.id,
      displayName: u.riotId.split("#")[0],
      agent: agentsPool[(i + j) % agentsPool.length],
      kills: 8 + ((i * 7 + j * 5) % 16),
      deaths: 7 + ((i * 3 + j * 4) % 12),
      assists: (i + j * 2) % 9,
      acs: 150 + ((i * 37 + j * 53) % 140),
    }));
    // el 5.º jugador (coach no juega) queda como jugador sin match
    teamStats.push({ displayName: "sub_" + (i % 3), agent: agentsPool[(i + 9) % agentsPool.length], kills: 10, deaths: 11, assists: 3, acs: 172 });
    db.scrims.push({
      id: oid(), teamId, createdBy: db.users[0].id, type, map,
      opponentName: rivals[i % rivals.length],
      teamRounds: tr, enemyRounds: er,
      outcome: tr > er ? "WIN" : tr < er ? "LOSS" : "DRAW",
      screenshotUrl: "/uploads/scrims/seed-scoreboard.png",
      teamStats, enemyComposition: [0, 1, 2, 3, 4].map((k) => agentsPool[(i * 5 + k * 3) % agentsPool.length]),
      createdAt: new Date(Date.now() - (results.length - i) * 4 * 864e5 + 3 * 36e5).toISOString(),
      updatedAt: now(),
    });
  });

  const strats = [
    ["Default A con Sova", "Ascent", "ATTACK", "Sova recon en heaven, Omen smokes tree y CT. Jett entra por main cuando cae la primera info."],
    ["Split push mid", "Ascent", "ATTACK", "Abrimos market y catwalk al mismo tiempo."],
    ["Setup A retake", "Ascent", "DEFENSE", "Killjoy en site, Sova flechas desde tree."],
    ["Retake B", "Bind", "DEFENSE", "Viper wall desde hookah, KAY/O flash por garden. Nadie entra antes del flash."],
    ["Fast B", "Split", "ATTACK", ""],
    ["Anti-eco C", "Lotus", "DEFENSE", "Stack C con 3, Killjoy setup en A main."],
    ["Default C lenta", "Lotus", "ATTACK", "控 mid, rotamos a C si no hay info."],
  ];
  strats.forEach(([name, map, side, notes], i) => {
    db.strats.push({ id: oid(), teamId, createdBy: db.users[1].id, name, map, side, notes: notes || undefined, screenshotUrl: `/uploads/strats/seed-strat-${(i % 2) + 1}.png`, createdAt: new Date(Date.now() - (5 - i) * 864e5).toISOString(), updatedAt: now() });
  });
}
seed();

// ---------- auth ----------
const sessions = new Map(); // access token -> userId
function issueTokens(userId) {
  const accessToken = "acc_" + crypto.randomBytes(16).toString("hex");
  const refreshToken = "ref_" + crypto.randomBytes(16).toString("hex");
  sessions.set(accessToken, userId);
  db.refresh.set(refreshToken, userId);
  return { accessToken, refreshToken };
}

function membershipOf(userId) {
  return db.members.find((m) => m.userId === userId) ?? null;
}

function auth(req, _res, next) {
  const h = req.headers.authorization ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  const userId = token ? sessions.get(token) : null;
  if (!userId) return next(new HttpError(401, "Unauthorized"));
  const user = db.users.find((u) => u.id === userId);
  if (!user) return next(new HttpError(401, "Unauthorized"));
  req.user = { userId: user.id, email: user.email, teamMember: membershipOf(user.id) };
  next();
}

function requireMember(req, _res, next) {
  if (!req.user.teamMember) return next(new HttpError(403, "User is not a member of a team"));
  next();
}

function requireFullTeam(req, _res, next) {
  const teamId = req.params.teamId ?? req.user.teamMember.teamId;
  const count = db.members.filter((m) => m.teamId === teamId).length;
  if (count < 5) return next(new HttpError(403, "Team must have 5 members to submit scrims"));
  next();
}

// ---------- serializers (misma forma que los ResponseDto) ----------
const memberDto = (m) => (m ? { id: m.id, userId: m.userId, teamId: m.teamId, role: m.role, isAdmin: m.isAdmin, joinedAt: m.joinedAt } : null);
const teamDto = (t) => ({ id: t.id, name: t.name, tag: t.tag, createdBy: t.createdBy, inviteCode: t.inviteCode, createdAt: t.createdAt });
const userDto = (u) => ({ id: u.id, email: u.email, username: u.username, riotId: u.riotId, altAccountId: u.altAccountId, createdAt: u.createdAt });
const scrimDto = (s) => ({ ...s });
const stratDto = (s) => ({ ...s });

// ---------- app ----------
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(UPLOADS));

const upload = (dir) =>
  multer({
    storage: multer.diskStorage({
      destination: path.join(UPLOADS, dir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 50) || "scrim";
        cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    }),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        return cb(bad(`Invalid file type: ${file.mimetype}. Allowed: image/jpeg, image/png, image/webp`));
      }
      cb(null, true);
    },
  }).single("screenshot");

const api = express.Router();

// users
api.post("/users", (req, res, next) => {
  const { email, password, username, riotId } = req.body ?? {};
  const details = [];
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) details.push("email must be an email");
  if (typeof password !== "string" || password.length < 6) details.push("password must be longer than or equal to 6 characters");
  if (typeof username !== "string") details.push("username must be a string");
  if (typeof riotId !== "string") details.push("riotId must be a string");
  if (details.length) return next(bad(details[0], details));
  const parsed = parseRiotId(riotId);
  if (!parsed) return next(bad("Invalid riotId format. Use: gameUsername#TAG"));
  if (db.users.some((u) => u.email === email)) return next(new HttpError(500, "Internal server error")); // dup key en Mongo
  const u = { id: oid(), email, password, username, riotId: parsed.riotId, createdAt: now() };
  db.users.push(u);
  ok(res, userDto(u), 201);
});

api.get("/users/me", auth, (req, res) => {
  const u = db.users.find((x) => x.id === req.user.userId);
  ok(res, { userId: u.id, email: u.email, username: u.username, riotId: u.riotId, altAccountId: u.altAccountId, teamMember: memberDto(req.user.teamMember) });
});

api.put("/users/me", auth, (req, res, next) => {
  const dto = req.body ?? {};
  const u = db.users.find((x) => x.id === req.user.userId);
  if (dto.username !== undefined) {
    if (typeof dto.username !== "string" || dto.username.length < 3) return next(bad("username must be longer than or equal to 3 characters"));
    u.username = dto.username;
  }
  if (dto.password !== undefined) {
    if (typeof dto.password !== "string" || dto.password.length < 6) return next(bad("password must be longer than or equal to 6 characters"));
    u.password = dto.password;
  }
  if (dto.altAccountId !== undefined) {
    if (typeof dto.altAccountId !== "string") return next(bad("altAccountId must be a string"));
    const parsed = dto.altAccountId ? parseRiotId(dto.altAccountId) : null;
    u.altAccountId = parsed ? parsed.riotId : dto.altAccountId; // el backend real guarda lo que venga si no parsea
  }
  ok(res, userDto(u));
});

// auth
api.post("/auth/login", (req, res, next) => {
  const { email, password } = req.body ?? {};
  const u = db.users.find((x) => x.email === email);
  if (!u || u.password !== password) return next(new HttpError(401, "Invalid credentials"));
  ok(res, issueTokens(u.id), 201);
});

api.post("/auth/refresh", (req, res, next) => {
  const { refreshToken } = req.body ?? {};
  const userId = db.refresh.get(refreshToken);
  if (!userId) return next(new HttpError(401, "Invalid refresh token"));
  db.refresh.delete(refreshToken);
  ok(res, issueTokens(userId), 201);
});

// teams
api.post("/teams", auth, (req, res, next) => {
  const { name, tag } = req.body ?? {};
  const details = [];
  if (typeof name !== "string" || name.length < 3 || name.length > 30) details.push("name must be longer than or equal to 3 and shorter than or equal to 30 characters");
  if (typeof tag !== "string" || tag.length < 3 || tag.length > 5) details.push("tag must be longer than or equal to 3 and shorter than or equal to 5 characters");
  if (details.length) return next(bad(details[0], details));
  if (req.user.teamMember) return next(bad("User is already a member of a team"));
  const t = { id: oid(), name, tag, createdBy: req.user.userId, inviteCode: crypto.randomBytes(9).toString("base64url").slice(0, 12), createdAt: now() };
  db.teams.push(t);
  db.members.push({ id: oid(), userId: req.user.userId, teamId: t.id, role: "MANAGER", isAdmin: true, joinedAt: now() });
  ok(res, teamDto(t), 201);
});

api.get("/teams/me", auth, requireMember, (req, res) => {
  ok(res, teamDto(db.teams.find((t) => t.id === req.user.teamMember.teamId)));
});

api.get("/teams/member", auth, requireMember, (req, res) => {
  const list = db.members
    .filter((m) => m.teamId === req.user.teamMember.teamId)
    .map((m) => {
      const u = db.users.find((x) => x.id === m.userId);
      return { id: m.id, teamId: m.teamId, role: m.role, isAdmin: m.isAdmin, joinedAt: m.joinedAt, user: { id: u.id, username: u.username, riotId: u.riotId, altAccountId: u.altAccountId } };
    });
  ok(res, list);
});

api.post("/teams/join", auth, (req, res, next) => {
  const { inviteCode } = req.body ?? {};
  if (typeof inviteCode !== "string" || !inviteCode) return next(bad("inviteCode should not be empty"));
  if (req.user.teamMember) return next(bad("User already belongs to a team"));
  const t = db.teams.find((x) => x.inviteCode === inviteCode);
  if (!t) return next(bad("Invalid invite code"));
  const m = { id: oid(), userId: req.user.userId, teamId: t.id, role: "PLAYER", isAdmin: false, joinedAt: now() };
  db.members.push(m);
  ok(res, memberDto(m), 201);
});

function requireAdmin(req, _res, next) {
  if (!req.user.teamMember?.isAdmin) return next(new HttpError(403, "Forbidden resource"));
  next();
}
const TEAM_ROLES = ["PLAYER", "COACH", "MANAGER"];
function findMember(teamId, userId) {
  return db.members.find((m) => m.teamId === teamId && m.userId === userId);
}

api.delete("/teams/member/:userId", auth, requireMember, requireAdmin, (req, res, next) => {
  const teamId = req.user.teamMember.teamId;
  const target = findMember(teamId, req.params.userId);
  if (!target) return next(bad("Member not found in team"));
  if (target.isAdmin && db.members.filter((m) => m.teamId === teamId && m.isAdmin).length <= 1) return next(bad("Team must have at least one admin"));
  db.members = db.members.filter((m) => m !== target);
  ok(res, { deleted: true });
});

api.patch("/teams/member/:userId/admin", auth, requireMember, requireAdmin, (req, res, next) => {
  const { isAdmin } = req.body ?? {};
  if (typeof isAdmin !== "boolean") return next(bad("isAdmin must be a boolean value"));
  const teamId = req.user.teamMember.teamId;
  const target = findMember(teamId, req.params.userId);
  if (!target) return next(bad("Target member not found in team"));
  if (!isAdmin && target.isAdmin && db.members.filter((m) => m.teamId === teamId && m.isAdmin).length <= 1) return next(bad("Team must have at least one admin"));
  target.isAdmin = isAdmin;
  ok(res, memberDto(target));
});

api.patch("/teams/member/:userId/role", auth, requireMember, requireAdmin, (req, res, next) => {
  const { role } = req.body ?? {};
  if (!TEAM_ROLES.includes(role)) return next(bad("role must be one of the following values: PLAYER, COACH, MANAGER"));
  const target = findMember(req.user.teamMember.teamId, req.params.userId);
  if (!target) return next(bad("Target member not found"));
  target.role = role;
  ok(res, memberDto(target));
});

api.post("/teams/member/:userId/transfer-admin", auth, requireMember, requireAdmin, (req, res, next) => {
  const teamId = req.user.teamMember.teamId;
  if (req.params.userId === req.user.userId) return next(bad("Cannot transfer admin to self"));
  const actor = findMember(teamId, req.user.userId);
  const target = findMember(teamId, req.params.userId);
  if (!actor) return next(bad("Actor member not found"));
  if (!target) return next(bad("Target member not found"));
  actor.isAdmin = false;
  target.isAdmin = true;
  ok(res, { transferred: true }, 201);
});

// dashboard (misma aritmética que DashboardService)
api.get("/dashboard", auth, requireMember, (req, res) => {
  const teamId = req.user.teamMember.teamId;
  const team = db.teams.find((t) => t.id === teamId);
  const all = db.scrims.filter((s) => s.teamId === teamId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = (list, o) => list.filter((s) => s.outcome === o).length;
  const winrate = (list) => (list.length ? round1((count(list, "WIN") / list.length) * 100) : 0);
  const last10 = all.slice(0, 10);
  const byMap = new Map();
  for (const s of all) {
    const e = byMap.get(s.map) ?? { name: s.map, matches: 0, wins: 0, losses: 0, draws: 0, roundDiff: 0 };
    e.matches++;
    if (s.outcome === "WIN") e.wins++;
    else if (s.outcome === "LOSS") e.losses++;
    else e.draws++;
    e.roundDiff += s.teamRounds - s.enemyRounds;
    byMap.set(s.map, e);
  }
  const bestMap = [...byMap.values()]
    .map((e) => ({ ...e, winrate: round1((e.wins / e.matches) * 100) }))
    .sort((a, b) => b.winrate - a.winrate || b.matches - a.matches || b.roundDiff - a.roundDiff)[0] ?? null;
  ok(res, {
    team: team ? { id: team.id, name: team.name, tag: team.tag } : null,
    overview: {
      total: all.length, wins: count(all, "WIN"), losses: count(all, "LOSS"), draws: count(all, "DRAW"), winrate: winrate(all),
      roundDiff: all.reduce((acc, s) => acc + s.teamRounds - s.enemyRounds, 0),
      avgTeamRounds: all.length ? round1(all.reduce((a, s) => a + s.teamRounds, 0) / all.length) : 0,
      avgEnemyRounds: all.length ? round1(all.reduce((a, s) => a + s.enemyRounds, 0) / all.length) : 0,
    },
    last10: { total: last10.length, wins: count(last10, "WIN"), losses: count(last10, "LOSS"), draws: count(last10, "DRAW"), winrate: winrate(last10) },
    bestMap,
    recentScrims: all.slice(0, 5).map(({ id, type, map, outcome, teamRounds, enemyRounds, createdAt }) => ({ id, type, map, outcome, teamRounds, enemyRounds, createdAt })),
  });
});

// ---------- suscripción y cupo ----------
// Plan gratis: 1 scrim por día. Pro: sin tope.
const FREE_DAILY_LIMIT = 1;
db.subscriptions = new Map(); // teamId -> { plan, status, currentPeriodEnd }

function planOf(teamId) {
  return db.subscriptions.get(teamId) ?? { plan: "FREE", status: "ACTIVE", currentPeriodEnd: null };
}

function startOfTomorrow() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
}
function startOfNextMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
}

function quotaOf(teamId) {
  const { plan } = planOf(teamId);
  if (plan === "PRO") {
    return { period: "MONTH", limit: null, used: 0, remaining: null, resetsAt: startOfNextMonth() };
  }
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const used = db.scrims.filter((s) => s.teamId === teamId && new Date(s.createdAt) >= since).length;
  return {
    period: "DAY",
    limit: FREE_DAILY_LIMIT,
    used,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    resetsAt: startOfTomorrow(),
  };
}

/** 402 con code QUOTA_EXCEEDED, que es lo que el front detecta. */
function enforceQuota(req, _res, next) {
  const teamId = req.params.teamId ?? req.user.teamMember.teamId;
  const q = quotaOf(teamId);
  if (q.limit !== null && q.remaining <= 0) {
    const err = new HttpError(402, "Free plan allows 1 scrim per day. Upgrade to Pro for unlimited scrims.");
    err.code = "QUOTA_EXCEEDED";
    return next(err);
  }
  next();
}

api.get("/teams/:teamId/subscription", auth, requireMember, (req, res) => {
  const { plan, status, currentPeriodEnd } = planOf(req.params.teamId);
  ok(res, { plan, status, currentPeriodEnd, quota: quotaOf(req.params.teamId) });
});

api.post("/teams/:teamId/subscription/checkout", auth, requireMember, requireAdmin, (req, res) => {
  // En el mock no hay pasarela: se marca como Pro y se devuelve una URL de vuelta.
  db.subscriptions.set(req.params.teamId, {
    plan: "PRO",
    status: "ACTIVE",
    currentPeriodEnd: startOfNextMonth(),
  });
  ok(res, { url: "/app/settings?checkout=demo" }, 201);
});

// players — GET /teams/:teamId/members/:userId/stats
function round2(n) { return Math.round(n * 100) / 100; }
function combat(list, userId) {
  let wins = 0, losses = 0, draws = 0, kills = 0, deaths = 0, assists = 0, acs = 0;
  for (const s of list) {
    if (s.outcome === "WIN") wins++; else if (s.outcome === "LOSS") losses++; else draws++;
    const p = s.teamStats.find((x) => x.userId === userId);
    if (p) { kills += p.kills; deaths += p.deaths; assists += p.assists; acs += p.acs; }
  }
  const n = list.length || 1;
  return {
    matches: list.length, wins, losses, draws,
    winrate: list.length ? round1((wins / list.length) * 100) : 0,
    kills, deaths, assists,
    avgKills: round1(kills / n), avgDeaths: round1(deaths / n), avgAssists: round1(assists / n),
    avgAcs: Math.round(acs / n), kd: round2(deaths === 0 ? kills : kills / deaths),
  };
}

api.get("/teams/:teamId/members/:userId/stats", auth, requireMember, (req, res, next) => {
  const { teamId, userId } = req.params;
  const member = findMember(teamId, userId);
  if (!member) return next(new HttpError(404, "Member not found in team"));
  const u = db.users.find((x) => x.id === userId);
  const played = db.scrims
    .filter((s) => s.teamId === teamId && s.teamStats.some((p) => p.userId === userId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const groupBy = (keyOf) => {
    const m = new Map();
    for (const s of played) {
      const p = s.teamStats.find((x) => x.userId === userId);
      const key = keyOf(s, p);
      const e = m.get(key) ?? { name: key, matches: 0, wins: 0, losses: 0, draws: 0, kills: 0, deaths: 0, acs: 0 };
      e.matches++;
      if (s.outcome === "WIN") e.wins++; else if (s.outcome === "LOSS") e.losses++; else e.draws++;
      e.kills += p.kills; e.deaths += p.deaths; e.acs += p.acs;
      m.set(key, e);
    }
    return [...m.values()].map((e) => ({
      name: e.name, matches: e.matches, wins: e.wins, losses: e.losses, draws: e.draws,
      winrate: round1((e.wins / e.matches) * 100),
      avgAcs: Math.round(e.acs / e.matches),
      kd: round2(e.deaths === 0 ? e.kills : e.kills / e.deaths),
    })).sort((a, b) => b.matches - a.matches);
  };

  ok(res, {
    player: {
      id: member.id, teamId: member.teamId, role: member.role, isAdmin: member.isAdmin, joinedAt: member.joinedAt,
      user: { id: u.id, username: u.username, riotId: u.riotId, altAccountId: u.altAccountId },
    },
    overview: combat(played, userId),
    last10: combat(played.slice(0, 10), userId),
    agents: groupBy((_s, p) => p.agent),
    maps: groupBy((s) => s.map),
    recentScrims: played.slice(0, 10).map((s) => {
      const p = s.teamStats.find((x) => x.userId === userId);
      return {
        id: s.id, type: s.type, map: s.map, outcome: s.outcome, opponentName: s.opponentName,
        teamRounds: s.teamRounds, enemyRounds: s.enemyRounds,
        agent: p.agent, kills: p.kills, deaths: p.deaths, assists: p.assists, acs: p.acs,
        createdAt: s.createdAt,
      };
    }),
  });
});

// scrims
const SCRIM_TYPES = ["SCRIM", "TOURNAMENT", "PREMIER"];

function validateScrim(body) {
  const details = [];
  const v = { ...body };
  if (typeof v.teamRounds === "string") v.teamRounds = Number(v.teamRounds);
  if (typeof v.enemyRounds === "string") v.enemyRounds = Number(v.enemyRounds);
  for (const k of ["teamStats", "enemyComposition"]) {
    if (typeof v[k] === "string") {
      try { v[k] = JSON.parse(v[k]); } catch { throw bad(`${k} must be valid JSON`); }
    }
  }
  if (!SCRIM_TYPES.includes(v.type)) details.push("type must be one of the following values: SCRIM, TOURNAMENT, PREMIER");
  if (!MAPS.includes(v.map)) details.push(`map must be one of the following values: ${MAPS.join(", ")}`);
  if (typeof v.opponentName !== "string" || !v.opponentName.trim()) details.push("opponentName should not be empty");
  for (const k of ["teamRounds", "enemyRounds"]) {
    if (!Number.isInteger(v[k]) || v[k] < 0 || v[k] > 24) details.push(`${k} must be an integer between 0 and 24`);
  }
  if (!Array.isArray(v.teamStats) || v.teamStats.length !== 5) details.push("teamStats must contain 5 elements");
  else v.teamStats.forEach((p, i) => {
    if (!p.displayName && !isOid(p.userId)) details.push(`teamStats.${i}.userId must be a mongodb id`);
    if (!p.userId && (typeof p.displayName !== "string" || !p.displayName)) details.push(`teamStats.${i}.displayName should not be empty`);
    if (!AGENTS_WITH_UNKNOWN.includes(p.agent)) details.push(`teamStats.${i}.agent must be a valid ValorantAgent`);
    for (const k of ["kills", "deaths", "assists", "acs"]) if (!Number.isInteger(p[k]) || p[k] < 0) details.push(`teamStats.${i}.${k} must be an integer >= 0`);
  });
  if (!Array.isArray(v.enemyComposition) || v.enemyComposition.length !== 5 || !v.enemyComposition.every((a) => AGENTS_WITH_UNKNOWN.includes(a)))
    details.push("enemyComposition must contain 5 valid ValorantAgent values");
  if (details.length) throw bad(details[0], details);
  return v;
}

api.get("/teams/:teamId/scrims", auth, requireMember, (req, res, next) => {
  const q = req.query ?? {};
  if (q.map && !MAPS.includes(q.map)) return next(bad("map must be a valid ValorantMap"));
  if (q.type && !SCRIM_TYPES.includes(q.type)) return next(bad("type must be a valid ScrimType"));
  if (q.outcome && !["WIN", "LOSS", "DRAW"].includes(q.outcome)) return next(bad("outcome must be a valid ScrimOutcome"));

  const agents = String(q.agents ?? "").split(",").map((a) => a.trim()).filter(Boolean);
  for (const a of agents) if (!AGENTS_WITH_UNKNOWN.includes(a)) return next(bad(`agents must contain valid ValorantAgent values`));
  const exact = q.exactComposition === "true" || q.exactComposition === "1";

  let list = db.scrims.filter((s) => s.teamId === req.params.teamId);
  if (q.map) list = list.filter((s) => s.map === q.map);
  if (q.type) list = list.filter((s) => s.type === q.type);
  if (q.outcome) list = list.filter((s) => s.outcome === q.outcome);
  if (q.opponentName) {
    const needle = String(q.opponentName).toLowerCase();
    list = list.filter((s) => (s.opponentName ?? "").toLowerCase().includes(needle));
  }
  if (agents.length) {
    list = list.filter((s) =>
      exact
        ? s.enemyComposition.length === agents.length && agents.every((a) => s.enemyComposition.includes(a))
        : agents.every((a) => s.enemyComposition.includes(a))
    );
  }
  if (q.playerId) list = list.filter((s) => s.teamStats.some((p) => p.userId === q.playerId));
  if (q.from) list = list.filter((s) => s.createdAt >= q.from);
  if (q.to) list = list.filter((s) => s.createdAt <= q.to);

  list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (q.limit) list = list.slice(0, Number(q.limit));
  ok(res, list.map(scrimDto));
});
api.get("/teams/:teamId/scrims/:scrimId", auth, requireMember, (req, res, next) => {
  const s = db.scrims.find((x) => x.teamId === req.params.teamId && x.id === req.params.scrimId);
  if (!s) return next(new HttpError(404, "Scrim not found"));
  ok(res, scrimDto(s));
});
api.post("/teams/:teamId/scrims/parse-screenshot", auth, requireMember, requireFullTeam, enforceQuota, upload("scrims"), (req, res, next) => {
  if (!req.file) return next(bad("File is required"));
  const { type, map } = req.body ?? {};
  if (!SCRIM_TYPES.includes(type)) return next(bad("type must be one of the following values: SCRIM, TOURNAMENT, PREMIER"));
  if (!MAPS.includes(map)) return next(bad("map must be a valid ValorantMap"));
  fs.rmSync(req.file.path, { force: true }); // el parse no persiste la captura
  const members = db.members.filter((m) => m.teamId === req.params.teamId).slice(0, 4);
  const parsedAgents = ["Jett", "Omen", "Sova", "Killjoy", "UNKNOWN"];
  const teamStats = members.map((m, i) => {
    const u = db.users.find((x) => x.id === m.userId);
    return { userId: u.id, displayName: u.riotId.split("#")[0], agent: parsedAgents[i], kills: 14 + i, deaths: 11 - i, assists: 3 + i, acs: 230 - i * 20 };
  });
  teamStats.push({ displayName: "UNKNOWN", agent: "UNKNOWN", kills: 9, deaths: 13, assists: 2, acs: 141 });
  setTimeout(() => {
    ok(res, {
      rawOutputId: oid(),
      warnings: ["Team agents include UNKNOWN (1/5). Please verify.", "Some team players could not be matched (1/5). Please assign."],
      draft: { type, map, teamRounds: 13, enemyRounds: 9, outcome: "WIN", enemyComposition: ["Raze", "Viper", "Cypher", "Fade", "UNKNOWN"], teamStats },
    }, 201);
  }, PARSE_DELAY_MS);
});
api.post("/teams/:teamId/scrims", auth, requireMember, requireFullTeam, enforceQuota, upload("scrims"), (req, res, next) => {
  if (!req.file) return next(bad("File is required"));
  let v;
  try { v = validateScrim(req.body); } catch (e) { return next(e); }
  const s = {
    id: oid(), teamId: req.params.teamId, createdBy: req.user.userId, type: v.type, map: v.map,
    opponentName: v.opponentName.trim(),
    teamRounds: v.teamRounds, enemyRounds: v.enemyRounds,
    outcome: v.teamRounds > v.enemyRounds ? "WIN" : v.teamRounds < v.enemyRounds ? "LOSS" : "DRAW",
    screenshotUrl: `/uploads/scrims/${req.file.filename}`,
    teamStats: v.teamStats.map((p) => ({ userId: p.userId, displayName: p.displayName, agent: p.agent, kills: p.kills, deaths: p.deaths, assists: p.assists, acs: p.acs })),
    enemyComposition: v.enemyComposition, createdAt: now(), updatedAt: now(),
  };
  db.scrims.push(s);
  ok(res, scrimDto(s), 201);
});

// strats
api.get("/teams/:teamId/strats", auth, requireMember, (req, res) => {
  ok(res, db.strats.filter((s) => s.teamId === req.params.teamId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(stratDto));
});
api.get("/teams/:teamId/strats/:stratId", auth, requireMember, (req, res, next) => {
  const s = db.strats.find((x) => x.teamId === req.params.teamId && x.id === req.params.stratId);
  if (!s) return next(new HttpError(404, "Strat not found"));
  ok(res, stratDto(s));
});
api.post("/teams/:teamId/strats", auth, requireMember, upload("strats"), (req, res, next) => {
  if (!req.file) return next(bad("File is required"));
  const { name, map, side, notes } = req.body ?? {};
  const details = [];
  if (typeof name !== "string" || !name) details.push("name should not be empty");
  if (!MAPS.includes(map)) details.push(`map must be one of the following values: ${MAPS.join(", ")}`);
  if (!SIDES.includes(side)) details.push("side must be one of the following values: ATTACK, DEFENSE");
  if (notes !== undefined && (typeof notes !== "string" || notes.length > 5000)) details.push("notes must be shorter than or equal to 5000 characters");
  if (details.length) return next(bad(details[0], details));
  const s = { id: oid(), teamId: req.params.teamId, createdBy: req.user.userId, name, map, side, notes: notes || undefined, screenshotUrl: `/uploads/strats/${req.file.filename}`, createdAt: now(), updatedAt: now() };
  db.strats.push(s);
  ok(res, stratDto(s), 201);
});

app.use("/api", api);
app.use((_req, res) => res.status(404).json({ success: false, data: null, error: { statusCode: 404, message: "Cannot GET" }, meta: { timestamp: now() } }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : err?.code === "LIMIT_FILE_SIZE" ? 400 : 500;
  const message = err instanceof HttpError ? err.message : err?.code === "LIMIT_FILE_SIZE" ? "File too large" : "Internal server error";
  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    data: null,
    error: {
      statusCode: status,
      message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details ? { details: err.details } : {}),
    },
    meta: { timestamp: now() },
  });
});

app.listen(PORT, () => console.log(`Scrimbase mock API en http://localhost:${PORT}/api  (admin@scrimbase.gg / password)`));
