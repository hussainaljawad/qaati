/**
 * قاعدة بيانات Postgres محلية للتطوير بدون تثبيت أي شيء (بديل اختياري عن Neon).
 * يشغّل Postgres حقيقي داخل مجلد المشروع (.postgres/) على المنفذ 54329.
 *
 *   npm run db:local          # يشغّل القاعدة ويترك النافذة مفتوحة
 *
 * ثم في ملف .env استخدم:
 *   DATABASE_URL="postgresql://qaati:qaati@localhost:54329/qaati"
 *   DIRECT_URL="postgresql://qaati:qaati@localhost:54329/qaati"
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, ".postgres");
const PORT = 54329;
const isFirstRun = !existsSync(dataDir);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "qaati",
  password: "qaati",
  port: PORT,
  persistent: true,
});

if (isFirstRun) {
  console.log("أول تشغيل — تهيئة قاعدة البيانات…");
  await pg.initialise();
}

await pg.start();

if (isFirstRun) {
  await pg.createDatabase("qaati");
}

console.log(`\n✅ Postgres محلي شغّال على المنفذ ${PORT}`);
console.log(
  `   DATABASE_URL="postgresql://qaati:qaati@localhost:${PORT}/qaati"\n`,
);
console.log("   اترك هذه النافذة مفتوحة. أوقفها بـ Ctrl+C.\n");

const stop = async () => {
  console.log("\nإيقاف قاعدة البيانات…");
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
