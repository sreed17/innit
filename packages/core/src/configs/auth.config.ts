import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const pub_filename = resolve(process.cwd(), "./cert/rsa_pub.pem");
const priv_filename = resolve(process.cwd(), "./cert/rsa_priv.pem");

export const PUBLIC_KEY = readFileSync(pub_filename);
export const PRIVATE_KEY = readFileSync(priv_filename);

export default {
  keys: {
    public: PUBLIC_KEY,
    private: PRIVATE_KEY,
  },
};
