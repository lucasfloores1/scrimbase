import { UseInterceptors } from "@nestjs/common";
import { SerializeInterceptor } from "../interceptors/serialize.interceptor";

export function Serialize(dto: new (...args: any[]) => unknown) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
