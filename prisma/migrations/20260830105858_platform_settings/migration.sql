-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "plan_name_ar" TEXT NOT NULL DEFAULT 'باقة قاعتي',
    "plan_name_en" TEXT NOT NULL DEFAULT 'Qaati Plan',
    "price_monthly_fils" INTEGER NOT NULL DEFAULT 12000,
    "price_yearly_fils" INTEGER NOT NULL DEFAULT 120000,
    "currency" TEXT NOT NULL DEFAULT 'BHD',
    "bank_name" TEXT,
    "bank_account_name" TEXT,
    "bank_iban" TEXT,
    "bank_account_number" TEXT,
    "benefit_number" TEXT,
    "payment_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
