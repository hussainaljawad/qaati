# نشر «قاعتي» على Vercel

المشروع جاهز للنشر. تحتاج ثلاث خطوات: قاعدة بيانات (Neon) → مستودع Git → Vercel.
كل شي مجاني في البداية.

---

## ١) قاعدة بيانات — Neon

1. أنشئ حساباً على <https://neon.tech> ثم مشروعاً جديداً (اختر منطقة قريبة، مثل `eu-central-1`).
2. من صفحة المشروع اضغط **Connect** وانسخ رابطين:
   - **Pooled connection** → سيكون `DATABASE_URL`
   - **Direct connection** → سيكون `DIRECT_URL` (يُستخدم للـ migrations)
   - كلاهما ينتهي بـ `?sslmode=require`.

---

## ٢) رفع الكود إلى GitHub

المشروع فيه مستودع Git جاهز (أول commit تم). ارفعه:

```bash
cd ~/Downloads/qaati
gh repo create qaati --private --source=. --push
# أو يدوياً: أنشئ مستودعاً فارغاً على github.com ثم:
#   git remote add origin git@github.com:<user>/qaati.git
#   git push -u origin main
```

> ملف `.env` **لا يُرفع** (مستثنى في `.gitignore`). القيم الحقيقية تُضاف في Vercel فقط.

---

## ٣) Vercel

1. أنشئ حساباً على <https://vercel.com> واربطه بحساب GitHub.
2. **Add New → Project** واختر مستودع `qaati`. Vercel يكتشف Next.js تلقائياً.
3. في **Environment Variables** أضف (لكل البيئات Production/Preview/Development):

   | المفتاح | القيمة |
   |---|---|
   | `DATABASE_URL` | رابط Neon المُجمّع (Pooled) |
   | `DIRECT_URL` | رابط Neon المباشر (Direct) |
   | `AUTH_SECRET` | ولّده بـ `openssl rand -base64 32` |
   | `PLATFORM_ADMIN_EMAIL` | بريدك (لدخول `/platform`) |
   | `PLATFORM_ADMIN_PASSWORD` | كلمة مرور قوية |
   | `TRIAL_DAYS` | `14` (اختياري) |

4. اضغط **Deploy**.
   - أمر البناء `vercel-build` في `package.json` يشغّل: `prisma generate` ثم
     `prisma migrate deploy` (ينشئ كل الجداول في Neon) ثم `next build`.

---

## بعد أول نشر

- افتح `https://<اسم-مشروعك>.vercel.app` — الصفحة الرئيسية + التسجيل.
- لوحة المشغّل: `https://<اسم-مشروعك>.vercel.app/platform`.
- **بيانات العرض (اختياري)** — لتعبئة منشأة تجريبية مرة واحدة، شغّل محلياً مع رابط Neon:
  ```bash
  DATABASE_URL="<Neon-pooled>" DIRECT_URL="<Neon-direct>" npm run db:seed
  ```

## تحديثات لاحقة

كل `git push` إلى الفرع الرئيسي يعيد النشر تلقائياً. عند تغيير `schema.prisma`
ولّد migration محلياً (`npm run db:migrate:dev -- --name <اسم>`) وارفعه —
`vercel-build` يطبّقه على الإنتاج تلقائياً.

## نطاق مخصّص

من إعدادات مشروع Vercel → **Domains** أضف نطاقك (مثل `app.qaati.bh`).
