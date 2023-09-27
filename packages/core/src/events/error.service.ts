import { Socket } from "socket.io";

export type T_Error = {
  subject: string;
  message: string;
};

export async function emitError(sockt: Socket, input: T_Error, err?: any) {
  sockt.emit("error", {
    ...input,
    socketId: sockt.id,
    ...(typeof err?.toString === "function" ? { err: err.toString() } : {}),
  });
}
