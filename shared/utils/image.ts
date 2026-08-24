// Gateway IPFS al que normalizamos las imágenes. Path-style porque sirve los
// bytes reales tanto para CIDv1 (redirige a subdominio) como CIDv0 (directo).
const IPFS_GATEWAY = "https://dweb.link/ipfs/";

// Extrae "<cid>[/subpath]" de las formas IPFS conocidas:
// - ipfs://<cid>/<path>
// - https://<host>/ipfs/<cid>/<path>   (path-style: ipfs.io, pinata…)
// - https://<cid>.ipfs.<host>/<path>   (subdomain-style, incl. gateways por
//   service worker como inbrowser.link, que devuelven HTML y rompen el <img>)
// Devuelve null si no es una URL IPFS reconocible.
const extractIpfsPath = (url: string): string | null => {
  const trimmed = url.trim();
  if (trimmed.startsWith("ipfs://")) {
    return trimmed.slice("ipfs://".length).replace(/^ipfs\//, "");
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  // path-style: /ipfs/<cid>/...
  const pathMatch = parsed.pathname.match(/^\/ipfs\/(.+)$/);
  if (pathMatch?.[1]) return pathMatch[1];
  // subdomain-style: <cid>.ipfs.<host>
  const hostMatch = parsed.hostname.match(/^([^.]+)\.ipfs\./);
  if (hostMatch?.[1]) {
    const cid = hostMatch[1];
    const subpath = parsed.pathname.replace(/^\//, "");
    return subpath ? `${cid}/${subpath}` : cid;
  }
  return null;
};

// Normaliza una URL de imagen para poder mostrarla en un <img>. Las URLs IPFS se
// reescriben a un gateway que sirve los bytes reales; el resto pasa sin cambios.
export const resolveImageUrl = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;
  const ipfsPath = extractIpfsPath(url);
  return ipfsPath ? `${IPFS_GATEWAY}${ipfsPath}` : url;
};
