import prisma from "../../prisma";
import { OrganizationRole, MemberStatus } from "../../prisma/generated/client";

export class OrganizationService {
  static async createOrganization(data: {
    name: string;
    slug: string;
    description?: string;
    website?: string;
    userId: string;
  }) {
    try {
      // Check if slug is already taken
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });

      if (existingOrg) {
        const error = new Error("Organization slug already exists");
        error.code = "CONFLICT";
        throw error;
      }

      // Create organization with owner membership
      const organization = await prisma.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          website: data.website,
          members: {
            create: {
              userId: data.userId,
              role: OrganizationRole.OWNER,
              status: MemberStatus.ACTIVE,
              joinedAt: new Date(),
              permissions: {
                canManageMembers: true,
                canManageApis: true,
                canManageBilling: true,
                canViewAnalytics: true,
              },
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      return organization;
    } catch (error) {
      if (error.code === "CONFLICT") {
        throw error;
      }
      const serverError = new Error("Failed to create organization");
      serverError.code = "INTERNAL_SERVER_ERROR";
      throw serverError;
    }
  }

  static async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId,
        status: MemberStatus.ACTIVE,
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                apis: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return memberships.map((membership) => membership.organization);
  }

  static async getOrganizationById(organizationId: string, userId: string) {
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            apis: true,
            _count: {
              select: {
                apis: true,
                members: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      const error = new Error("Organization not found or access denied");
      error.code = "NOT_FOUND";
      throw error;
    }

    return membership.organization;
  }

  static async updateOrganization(
    organizationId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      website?: string;
    }
  ) {
    // Check if user has permission to update
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: {
          in: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
        },
      },
    });

    if (!membership) {
      const error = new Error(
        "Insufficient permissions to update organization"
      );
      error.code = "FORBIDDEN";
      throw error;
    }

    return prisma.organization.update({
      where: { id: organizationId },
      data,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  static async checkSlugAvailability(slug: string) {
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });
    return !existingOrg;
  }

  static async generateSlugFromName(name: string) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (!(await this.checkSlugAvailability(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
