/* Ҳостҳое, ки аксҳояшон хурд ва фишурда карда мешаванд (next/image).
   Акс аз ҳости дигар (масалан пайванде, ки дар admin илова шудааст) ҳамчун аслӣ нишон дода мешавад. */
export const IMAGE_HOSTS = [
  "cf.cjdropshipping.com",
  "oss-cf.cjdropshipping.com",
  "cdn.shopify.com",
  "eurolux.az",
  "f.nooncdn.com",
  "cdn.dsmcdn.com",
  "img.ltwebstatic.com",
  "cj-product-center.oss-accelerate.aliyuncs.com",
];

export function canOptimize(src: string) {
  if (src.startsWith("/")) return !src.endsWith(".svg");
  try {
    const u = new URL(src);
    return u.protocol === "https:" && IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
