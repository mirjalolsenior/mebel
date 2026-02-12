// VAPID keys are provided via environment variables
export const VAPID_KEYS = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
}

export function getPublicVAPIDKey() {
  return VAPID_KEYS.publicKey
}

export function getPrivateVAPIDKey() {
  return VAPID_KEYS.privateKey
}
