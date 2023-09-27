import { T_USession, USessionModel } from "../models/usession.model";
import dbConnection from "../models/connection";

export type T_SessionMeta = T_USession;

export async function updateSessionSocketId(
  sid: any,
  socketId: any,
  cb: (err: any, session_doc?: T_SessionMeta) => void
) {
  try {
    if (!socketId || !sid)
      throw new Error(
        "socketId and sid is required to establish socket connection"
      );
    const sDoc = await USessionModel.findByIdAndUpdate(
      sid,
      { socketId },
      { new: true }
    );
    if (!sDoc) throw new Error("Session does not exist");
    cb(null, sDoc);
  } catch (err) {
    cb(err);
  }
}

/** 
export async function createSession(
  input: any,
  cb: (err: any, uid?: T_SessionMeta) => void
) {
  try {
    const { uid } = input;
    if (!uid) throw new Error("uid is not present in socket handshake auth");
    const doc = new USessionModel(input);
    await doc.save();
    if (doc) cb(null, doc);
  } catch (err) {
    cb(err);
  }
}

export async function deleteSession(sid: string, cb: (err: any) => void) {
  try {
    if (!sid) throw new Error("sid(socketId) is required");
    await USessionModel.deleteOne({ socketId: sid });
    cb(null);
  } catch (err) {
    cb(err);
  }
}

type deleteSessionSids = { socketId: string };
export async function deleteSessions(sids: deleteSessionSids[]) {
  try {
    USessionModel.deleteMany(sids);
  } catch (err) {
    console.log("Error deleting all sessions");
  }
}

*/

export function listenToChanges(
  cb: (err: any, type: string, change?: any) => void
) {
  try {
    const changeStream = dbConnection
      .collection(USessionModel.collection.name)
      .watch();
    console.log("Listening to changes in usession collection...");
    changeStream.on("change", (change) => {
      switch (change.operationType) {
        case "insert": {
          cb(null, "insert", change.fullDocument);
          break;
        }
        case "update": {
          USessionModel.findById(change.documentKey._id)
            .exec()
            .then((doc) => {
              cb(null, "update", doc);
            })
            .catch((err) => cb(err, "update", { uid: change.documentKey._id }));
          break;
        }
        case "delete": {
          cb(null, "delete", null);
        }
      }
    });
    changeStream.on("error", (err) => {
      cb(err, "");
    });
  } catch (err) {}
}
