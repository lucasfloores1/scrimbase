import type { LoginResponse, LoginDto, RefreshDto } from "@/shared/types/dto";
import { http } from "@/shared/api/http";
import type { AuthUser } from "@/shared/types/models";

export const authApi = {
    login(dto : LoginDto) {
        return http.post<LoginResponse>("/auth/login", dto).then(res => res.data);
    },
    refresh(dto : RefreshDto){
        return http.post<LoginResponse>("/auth/refresh", dto).then(res => res.data);
    },
    me() {
        return http.get<AuthUser>("/auth/me").then(res => res.data);
    },
}