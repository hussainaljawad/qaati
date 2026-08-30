"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { orgProfileSchema, teamMemberSchema } from "@/lib/validation";

export async function updateOrgProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = orgProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  await db.organization.update({
    where: { id: session.organization.id },
    data: {
      name: d.name,
      phone: d.phone ?? null,
      address: d.address ?? null,
      vatNumber: d.vatNumber ?? null,
      crNumber: d.crNumber ?? null,
    },
  });

  revalidatePath("/settings");
  return { ok: true, message: "تم الحفظ" };
}

export async function addTeamMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = teamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  try {
    await db.user.create({
      data: {
        organizationId: session.organization.id,
        name: d.name,
        email: d.email,
        passwordHash: await hashPassword(d.password),
        role: d.role,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return fail("هذا البريد مستخدم في حساب آخر");
    }
    throw err;
  }

  revalidatePath("/settings/team");
  redirect("/settings/team");
}

export async function setTeamMemberActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === session.user.id) return; // لا يوقف نفسه

  const member = await db.user.findFirst({
    where: { id, organizationId: session.organization.id },
  });
  if (!member) return;

  await db.user.update({
    where: { id },
    data: { isActive: !member.isActive },
  });
  revalidatePath("/settings/team");
}
