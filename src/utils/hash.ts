/**
 * A digest of a secret, for the local account store.
 *
 * WHY THIS EXISTS
 *
 * There is no backend, so the accounts created on this device are the
 * only accounts there are, and they have to survive a restart — hence
 * the store in `src/state/authStore.ts`. Storing the password itself
 * would put it on disk in plain text, so the store keeps a digest of
 * it instead and compares digests.
 *
 * WHAT THIS IS NOT
 *
 * This is NOT a security boundary, and it is not pretending to be
 * one. It is a plain non-cryptographic hash: fast, dependency-free and
 * trivially reversible by anyone who wants to. It exists so that the
 * password is not sitting in AsyncStorage as plain text, nothing more.
 *
 * A real build would never do this — the server would hash the
 * password with bcrypt or argon2 and the client would never see a
 * digest at all. This build has no server, so the comparison has to
 * happen on the device, and the honest way to do that is to say what
 * the check is worth.
 */

/**
 * FNV-1a, 32 bit.
 *
 * Chosen because it is four lines of arithmetic and no dependency. The
 * second pass mixes the result with a different offset so the output
 * is wider than 32 bits, which makes accidental collisions between
 * two short passwords less likely.
 */
function fnv1a(text: string, seed: number): number {
  let hash = seed >>> 0;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    // 16777619 is FNV's prime; the multiplication is kept in 32 bits
    // with Math.imul so it does not lose precision on large values.
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash >>> 0;
}

/**
 * The digest of a secret.
 *
 * The result is hex, so it can be written to storage and compared as
 * a plain string.
 */
export function digestSecret(secret: string): string {
  const first = fnv1a(secret, 0x811c9dc5);
  const second = fnv1a(`${secret}::wayfare`, 0x1000193);

  return `${first.toString(16).padStart(8, '0')}${second
    .toString(16)
    .padStart(8, '0')}`;
}

/**
 * Whether two secrets match.
 *
 * Both sides are digested first, so a stored digest and a typed
 * password are compared the same way.
 */
export function secretsMatch(secret: string, storedDigest: string): boolean {
  return digestSecret(secret) === storedDigest;
}
