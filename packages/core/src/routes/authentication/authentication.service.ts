import { T_USession, USessionModel } from "../../models/usession.model";
import { findOneFromModel, findManyFromModel } from "../../models/transactions";

export async function getSessions(input: any) {
  return findManyFromModel<T_USession>(USessionModel, input);
}

export async function getSessionByUid(uid: string) {
  const filter = encodeURIComponent(JSON.stringify({ uid }));
  return findOneFromModel<T_USession>(USessionModel, filter);
}

export async function updateSessionById(id: string, input: any) {
  return USessionModel.findByIdAndUpdate(id, input);
}

export async function updateSessionByUid(uid: string, input: any) {
  return USessionModel.findOneAndUpdate({ uid }, input);
}
