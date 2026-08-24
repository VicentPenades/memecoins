// Convierte un texto libre en un slug URL-safe (kebab-case, sin acentos).
export const slugify = (input: string): string => {
  const s = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos separados por NFKD
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // todo lo no alfanumérico → guion
    .replace(/-+/g, "-") // colapsa guiones repetidos
    .replace(/^-+|-+$/g, ""); // recorta guiones de los extremos
  return s || "coin";
};

// Genera un slug único: parte de slugify(base) y añade -2, -3… si ya existe.
export const generateUniqueSlug = async (
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const root = slugify(base);
  if (!(await exists(root))) return root;
  let n = 2;
  while (await exists(`${root}-${n}`)) n++;
  return `${root}-${n}`;
};
