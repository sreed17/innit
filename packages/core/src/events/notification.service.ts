import { NotificationModel } from "../models/notification.model";
import dbConnection from "../models/connection";

export function listenToChanges(cb: (err: any, change?: any) => void) {
  try {
    const changeStream = dbConnection
      .collection(NotificationModel.collection.name)
      .watch();
    console.log("Listening to changes in the notification collection");
    changeStream.on("change", (change) => {
      switch (change.operationType) {
        case "insert": {
          return cb(null, change.fullDocument);
        }
      }
    });
    changeStream.on("error", (err) => {
      cb(err);
    });
  } catch (err) {}
}
