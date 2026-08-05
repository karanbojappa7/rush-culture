import { PrismaService } from '../../../../common/prisma/prisma.service';

export async function clearOtherDefaults(
  prisma: PrismaService,
  customerId: string,
  exceptId?: string,
): Promise<void> {
  await prisma.address.updateMany({
    where: {
      customerId,
      isDeleted: false,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}
