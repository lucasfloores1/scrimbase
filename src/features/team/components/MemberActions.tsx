import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, LogOut, MoreHorizontal, ShieldCheck, ShieldOff, UserMinus, UserPen } from "lucide-react";

import { teamsApi } from "@/shared/api/teams.api";
import type { TeamMemberListItem, TeamRole } from "@/shared/types/models";
import { errorMessage } from "@/shared/lib/format";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/shared/ui/toast/useToast";
import { ROLE_LABELS } from "@/shared/constants/roles";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  member: TeamMemberListItem;
  isSelf: boolean;
  adminCount: number;
};

type Confirm = { kind: "remove" | "transfer" | "leave"; title: string; description: string; action: string } | null;

/**
 * Menú de acciones por miembro. Solo se muestra a admins.
 * Cubre los cuatro endpoints de /teams/member: rol, admin, transferir admin y quitar.
 */
export function MemberActions({ member, isSelf, adminCount }: Props) {
  const queryClient = useQueryClient();
  const { bootstrap } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const userId = member.user.id;
  const name = member.user.username;
  const lastAdmin = member.isAdmin && adminCount <= 1;

  async function refresh(touchesSelf: boolean) {
    await queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    if (touchesSelf) await bootstrap();
  }

  const roleMutation = useMutation({
    mutationFn: (role: TeamRole) => teamsApi.setMemberRole(userId, role),
    onSuccess: async (_r, role) => {
      await refresh(isSelf);
      toast.success(`${name} ahora es ${ROLE_LABELS[role].toLowerCase()}.`);
    },
    onError: (e) => toast.error(errorMessage(e, "No se pudo cambiar el rol.")),
  });

  const adminMutation = useMutation({
    mutationFn: (isAdmin: boolean) => teamsApi.setMemberAdmin(userId, isAdmin),
    onSuccess: async (_r, isAdmin) => {
      await refresh(isSelf);
      toast.success(isAdmin ? `${name} ahora es admin.` : `${name} ya no es admin.`);
    },
    onError: (e) => toast.error(errorMessage(e, "No se pudo cambiar el permiso de admin.")),
  });

  const transferMutation = useMutation({
    mutationFn: () => teamsApi.transferAdmin(userId),
    onSuccess: async () => {
      await refresh(true);
      toast.success(`Administración transferida a ${name}.`);
    },
    onError: (e) => toast.error(errorMessage(e, "No se pudo transferir la administración.")),
  });

  const removeMutation = useMutation({
    mutationFn: () => teamsApi.removeMember(userId),
    onSuccess: async () => {
      await refresh(isSelf);
      toast.success(isSelf ? "Saliste del equipo." : `${name} fue quitado del equipo.`);
    },
    onError: (e) => toast.error(errorMessage(e, "No se pudo quitar al miembro.")),
  });

  const busy = roleMutation.isPending || adminMutation.isPending || transferMutation.isPending || removeMutation.isPending;

  function runConfirm() {
    if (!confirm) return;
    if (confirm.kind === "transfer") transferMutation.mutate();
    else removeMutation.mutate();
    setConfirm(null);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${name}`} disabled={busy}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPen />
              Cambiar rol
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={member.role} onValueChange={(v) => roleMutation.mutate(v as TeamRole)}>
                {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                  <DropdownMenuRadioItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {member.isAdmin ? (
            <DropdownMenuItem disabled={lastAdmin} onClick={() => adminMutation.mutate(false)}>
              <ShieldOff />
              {isSelf ? "Dejar de ser admin" : "Quitar admin"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => adminMutation.mutate(true)}>
              <ShieldCheck />
              Hacer admin
            </DropdownMenuItem>
          )}

          {!isSelf ? (
            <DropdownMenuItem
              onClick={() =>
                setConfirm({
                  kind: "transfer",
                  title: `¿Transferir la administración a ${name}?`,
                  description:
                    "Vos dejás de ser admin y pasás a ser un miembro más. Podés volver a serlo si el nuevo admin te lo da.",
                  action: "Transferir",
                })
              }
            >
              <Crown />
              Transferir administración
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          {isSelf ? (
            <DropdownMenuItem
              variant="destructive"
              disabled={lastAdmin}
              onClick={() =>
                setConfirm({
                  kind: "leave",
                  title: "¿Salir del equipo?",
                  description:
                    "Vas a perder acceso a las scrims y strats del equipo. Para volver necesitás un código de invitación.",
                  action: "Salir del equipo",
                })
              }
            >
              <LogOut />
              Salir del equipo
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={lastAdmin}
              onClick={() =>
                setConfirm({
                  kind: "remove",
                  title: `¿Quitar a ${name} del equipo?`,
                  description: "Pierde el acceso al equipo. Sus stats en las scrims ya registradas se conservan.",
                  action: "Quitar del equipo",
                })
              }
            >
              <UserMinus />
              Quitar del equipo
            </DropdownMenuItem>
          )}
          {lastAdmin ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              {isSelf ? "Sos el único admin: nombrá otro antes." : "Es el único admin: nombrá otro antes."}
            </p>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={runConfirm}>{confirm?.action}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default MemberActions;
