import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Users } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useMyTeam, useTeamMembers } from "@/shared/hooks/useTeam";
import type { TeamMemberListItem } from "@/shared/types/models";
import { errorMessage, formatDate, initials } from "@/shared/lib/format";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/shared/ui/layout/PageHeader";
import { RoleBadge } from "@/shared/ui/data/RoleBadge";
import { LoadingState } from "@/shared/ui/feedback/LoadingState";
import { ErrorState } from "@/shared/ui/feedback/ErrorState";
import { MemberActions } from "@/features/team/components/MemberActions";
import { cn } from "@/lib/utils";

const MIN_MEMBERS_TO_SUBMIT = 5;
const roleWeight = { MANAGER: 0, COACH: 1, PLAYER: 2 } as const;

function sortMembers(list: TeamMemberListItem[]) {
  return [...list].sort((a, b) => {
    if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
    const rw = (roleWeight[a.role] ?? 9) - (roleWeight[b.role] ?? 9);
    if (rw !== 0) return rw;
    return (a.user?.username ?? "").localeCompare(b.user?.username ?? "");
  });
}

function InviteCode({ code, memberCount }: { code: string; memberCount: number }) {
  const [copied, setCopied] = useState(false);
  const missing = Math.max(0, MIN_MEMBERS_TO_SUBMIT - memberCount);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el texto queda seleccionable igual */
    }
  }

  return (
    <div className="grid gap-4 panel p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="font-medium">Código de invitación</p>
        <p className="text-sm text-muted-foreground">
          {missing > 0
            ? `Faltan ${missing} ${missing === 1 ? "miembro" : "miembros"} para poder registrar scrims. Compartí el código para sumar al resto.`
            : "Compartilo con quien quieras sumar al equipo. Quien entra lo hace como jugador."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <code className="border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-sm tracking-wider text-amber select-all">{code}</code>
        <Button variant="outline" size="sm" onClick={copy} aria-live="polite">
          {copied ? <Check data-icon="inline-start" className="text-win" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}

export function TeamPage() {
  const { user } = useAuth();
  const team = useMyTeam();
  const members = useTeamMembers();
  const isAdmin = !!user?.teamMember?.isAdmin;

  const list = sortMembers(members.data ?? []);
  const adminCount = list.filter((m) => m.isAdmin).length;

  const header = (
    <PageHeader
      title={team.data?.name ?? "Equipo"}
      description={
        team.data ? (
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>#{team.data.tag}</span>
            {members.data ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />
                {members.data.length} {members.data.length === 1 ? "miembro" : "miembros"}
              </span>
            ) : null}
            {team.data.createdAt ? <span>desde {formatDate(team.data.createdAt, "short")}</span> : null}
          </span>
        ) : (
          "Miembros y roles."
        )
      }
    />
  );

  if (members.isLoading || team.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <LoadingState rows={5} />
      </div>
    );
  }

  if (members.isError) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          title="No se pudo cargar el equipo"
          description={errorMessage(members.error)}
          actionLabel="Reintentar"
          onAction={() => members.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {team.data?.inviteCode ? <InviteCode code={team.data.inviteCode} memberCount={list.length} /> : null}

      <div className="surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead className="hidden md:table-cell">Riot ID</TableHead>
              <TableHead className="hidden lg:table-cell">Cuenta alternativa</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden sm:table-cell">Desde</TableHead>
              {isAdmin ? <TableHead className="w-12" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((m) => {
              const isMe = m.user?.id === user?.userId;
              return (
                <TableRow key={m.id} className={cn(isMe && "bg-accent/20")}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border border-border">
                        <AvatarFallback className="bg-surface-2 text-xs">{initials(m.user?.username)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          to={`/app/team/${m.user.id}`}
                          className="font-medium hover:text-amber hover:underline underline-offset-4"
                        >
                          {m.user?.username}
                          {isMe ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(vos)</span> : null}
                        </Link>
                        <p className="text-xs text-muted-foreground md:hidden">{m.user?.riotId ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{m.user?.riotId ?? "—"}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{m.user?.altAccountId ?? "—"}</TableCell>
                  <TableCell>
                    <RoleBadge role={m.role} isAdmin={m.isAdmin} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(m.joinedAt, "short")}</TableCell>
                  {isAdmin ? (
                    <TableCell className="text-right">
                      <MemberActions member={m} isSelf={isMe} adminCount={adminCount} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isAdmin ? (
        <p className="text-xs text-muted-foreground">Los roles y permisos los administra un admin del equipo.</p>
      ) : null}
    </div>
  );
}

export default TeamPage;
