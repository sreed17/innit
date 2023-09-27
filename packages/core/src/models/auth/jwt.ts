import { PassportStatic } from "passport";
import { USessionModel } from "../usession.model";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { StrategyOptions, VerifiedCallback } from "passport-jwt";
import jwt from "jsonwebtoken";
import authConfig from "../../configs/auth.config";

const jwtOpts: StrategyOptions = {
  secretOrKey: authConfig.keys.public,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ["RS256"],
};

const verifySession = async (payload: any, done: VerifiedCallback) => {
  try {
    const _id = payload.sub;
    const uid = payload.uid;
    const doc = await USessionModel.findOne({ _id, uid });
    if (!doc) return done(null, false);
    done(null, doc);
  } catch (err) {
    done(err, false);
  }
};

const JwtStrategy = new Strategy(jwtOpts, verifySession);

export function generateJwt(
  id: string,
  uid: string,
  expiresIn: string = "14d"
) {
  const token = jwt.sign(
    { sub: id, uid, iat: Date.now() },
    authConfig.keys.private,
    { algorithm: "RS256", expiresIn }
  );
  return { token, expiresIn };
}

export const passportJwtConfig = (passport: PassportStatic) => {
  passport.use(JwtStrategy);
};

export function decodeJwtBearerToken(token: string) {
  token = token.replace("Bearer", "").trim();
  const payload = jwt.verify(token, authConfig.keys.private, {
    algorithms: ["RS256"],
  });
  return payload;
}

export type TokenPayload = {
  sub: string;
  uid: string;
  iat: number;
  exp: number;
};
