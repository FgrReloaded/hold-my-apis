import prisma from "../../prisma";

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: true,
          },
          orderBy: {
            joinedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }

    return user;
  }

  static async updateUserProfile(
    userId: string,
    data: {
      name?: string;
      image?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  static async hasCompletedOnboarding(userId: string) {
    const organizationCount = await prisma.organizationMember.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    return organizationCount > 0;
  }
}
