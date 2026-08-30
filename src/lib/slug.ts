/** slug من اسم المنشأة — يدعم العربي (يسقط لمعرّف عشوائي) مع لاحقة فريدة دائماً. */
export function makeSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/[؀-ۿ]+/g, "") // أسقط الحروف العربية من الـ slug
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  const suffix = crypto.randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : `hall-${suffix}`;
}
