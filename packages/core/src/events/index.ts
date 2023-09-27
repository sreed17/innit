import { Socket, Server as SocktServer } from "socket.io";
import type { Server, IncomingMessage, ServerResponse } from "http";
import * as SessionService from "./usession.service";
import * as NotificationService from "./notification.service";
import * as ErrorService from "./error.service";
import { decodeJwtBearerToken, TokenPayload } from "../models/auth/jwt";

const ActiveUsers = new Map<Socket, SessionService.T_SessionMeta>();

export default (
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) => {
  const io = new SocktServer(server);

  io.use((socket, next) => {
    const bearerToken = socket.request.headers.authorization;
    if (!bearerToken)
      return next(new Error("Bad request, require authorization header"));
    const payload = decodeJwtBearerToken(bearerToken) as TokenPayload;
    socket.data.session = {
      sid: payload.sub,
      uid: payload.uid,
      exp: payload.exp,
      iat: payload.iat,
    };
    next();
  });

  io.on("connection", async (socket) => {
    // create
    await SessionService.updateSessionSocketId(
      socket.data.session.sid,
      socket.id,
      (err: any, meta_doc?: SessionService.T_SessionMeta) => {
        if (err || !meta_doc) {
          ErrorService.emitError(
            socket,
            {
              subject: "create-session",
              message: "Error creating session entry",
            },
            err
          );
          socket.disconnect();
        } else ActiveUsers.set(socket, meta_doc);
      }
    );

    socket.on("disconnect", async (reason) => {
      await SessionService.updateSessionSocketId(
        socket.data.session.sid,
        "$undefined",
        (err: any) => {
          if (err)
            return ErrorService.emitError(
              socket,
              {
                subject: "delete-session",
                message: "Error deleting the session entry",
              },
              err
            );
          ActiveUsers.delete(socket);
        }
      );
    });

    //** Listen to changes in the notification collection */
    NotificationService.listenToChanges((err, notif) => {
      if (err) {
        return ErrorService.emitError(
          socket,
          {
            subject: "listen-notification",
            message: "Error when listening to the notification colln changes",
          },
          err
        );
      }
      const { recipients } = notif;
      const r_len = recipients.length;
      if (r_len > 0) {
        recipients.forEach((uid: string) => {
          // deliver the notification to the recipient
          for (const [sockt, sDoc] of ActiveUsers) {
            if (String(sDoc.uid) === String(uid))
              sockt.emit("notification", notif);
          }
        });
      } else {
        io.sockets.emit("notification", notif);
      }
    });

    //** Listen to changes in the session collection */
    SessionService.listenToChanges((err, changeType, session_doc) => {
      if (err) {
        return ErrorService.emitError(
          socket,
          {
            subject: "listen-session-change",
            message: "Error when listening to the usession colln changes",
          },
          err
        );
      }

      switch (changeType) {
        case "insert": {
          const { uid } = session_doc;
          console.log("Sesson insert update: ", uid);
          io.sockets.emit("session-change", { uid, changeType });
          break;
        }
        case "update": {
          const { uid, status } = session_doc;
          console.log("Sesson status update: ", status);
          io.sockets.emit("session-change", { uid, status, changeType });
          break;
        }
      }
    });
  });
};

/**
  export async function clearSesssions() {
  const sids = Array.from(ActiveUsers.keys()).map((sockt) => ({
    socketId: sockt.id,
  }));
  await SessionService.deleteSessions(sids);
}
*/
