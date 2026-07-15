/** Local provider stubs — no network */

export function localStatus(): { ok: true; mode: "local" } {
  return { ok: true, mode: "local" };
}
