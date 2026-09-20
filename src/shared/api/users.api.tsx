import type { RegisterDto, UpdateMeDto } from "@/shared/types/dto";
import { http } from "@/shared/api/http";

export const usersApi = {
    register(dto : RegisterDto ){
        return http.post("/users", dto).then(res => res.data);
    },
    updateMe(dto: UpdateMeDto) {
    return http.put("/users/me", dto).then((res) => res.data);
  },
}