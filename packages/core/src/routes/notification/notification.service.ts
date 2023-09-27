import { NotificationModel } from "../../models/notification.model";

export async function createNotification(input: any) {
  return NotificationModel.create(input);
}
