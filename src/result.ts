export type Result<T> = { ok: true; data: T } | { ok: false; data: Error };
