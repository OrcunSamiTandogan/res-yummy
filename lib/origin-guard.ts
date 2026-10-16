/** Basit CSRF koruması: state değiştiren istekler aynı origin'den mi? */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Origin göndermeyen istemciler (curl) zaten cookie taşımak zorunda
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
