const crypto = require("node:crypto");

const HASH_OPTIONS = {
  salt: process.env.PASSWORD_SALT || "aura-store-salt",
  iterations: Number(process.env.PASSWORD_ITERATIONS || 120000),
  keyLength: 64,
  digest: "sha512",
};

function hashPassword(password) {
  return crypto
    .pbkdf2Sync(
      String(password),
      HASH_OPTIONS.salt,
      HASH_OPTIONS.iterations,
      HASH_OPTIONS.keyLength,
      HASH_OPTIONS.digest,
    )
    .toString("hex");
}

function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  const computed = hashPassword(password);
  const left = Buffer.from(computed, "hex");
  const right = Buffer.from(String(passwordHash), "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

module.exports = {
  HASH_OPTIONS,
  hashPassword,
  verifyPassword,
};
