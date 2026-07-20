import { isAbsolute, join } from 'path';

/**
 * Where Surat Permohonan PDFs are written.
 *
 * Railway containers have an ephemeral filesystem, so in production this must
 * point at a mounted volume (e.g. UPLOADS_DIR=/data/uploads) or uploaded PDFs
 * disappear on every redeploy. Defaults to <project>/uploads for local dev.
 */
export function uploadsDir(): string {
  const configured = process.env.UPLOADS_DIR;
  if (configured) {
    return isAbsolute(configured) ? configured : join(process.cwd(), configured);
  }
  return join(process.cwd(), 'uploads');
}
