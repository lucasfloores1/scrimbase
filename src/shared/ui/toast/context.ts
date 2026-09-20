import { createContext } from "react";

export type ToastApi = { success: (message: string) => void; error: (message: string) => void };
export const ToastContext = createContext<ToastApi | null>(null);
