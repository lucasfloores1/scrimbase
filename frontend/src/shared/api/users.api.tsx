import type { RegisterDto } from "@/shared/types/dto";
import { http } from "@/shared/api/http";

export const usersApi = {
    register(dto : RegisterDto ){
        return http.post("/users", dto).then(res => res.data);
    },
}