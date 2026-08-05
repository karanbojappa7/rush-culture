import { PrismaService } from '../../../../common/prisma/prisma.service';

export async function clearOtherDefaults(
  prisma: PrismaService,
  userId: string,
  exceptId?: string,
): Promise<void> {
  await prisma.address.updateMany({
    where: {
      userId,
      isDeleted: false,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}
