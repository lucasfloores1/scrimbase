import type { CreateStratDto, StratDto } from "../types/dto";
import { http } from "./http";

export const stratsApi = {
    async list(teamId : string) : Promise<StratDto[]> {
        const { data } = await http.get<StratDto[]>(`/teams/${teamId}/strats`);
        return data;
    },

    async getOne( teamId: string, stratId : string ) : Promise<StratDto> {
        const { data } = await http.get<StratDto>(`/teams/${teamId}/strats/${stratId}`)
        return data
    },

    async create( teamId: string, file : File, dto : CreateStratDto ) {
        const fd =  new FormData();
        fd.append('screenshot', file);
        fd.append("map", dto.map);
        fd.append("name", dto.name);
        if (dto.notes) fd.append("notes", dto.notes);
        const { data } = await http.post<any>(`/teams/${teamId}/strats`, fd)
        return data
    }
}