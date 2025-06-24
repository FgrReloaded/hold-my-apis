import prisma from "../../prisma";
import { OrganizationRole, MemberStatus } from "../../prisma/generated/client";
import { TRPCError } from "@trpc/server";

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
        where: { slug: data.slug }
      });

      if (existingOrg) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization slug already exists"
        });
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
                canViewAnalytics: true
              }
            }
          }
        },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      });

      return organization;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create organization"
      });
    }
  }

  static async getUserOrganizations(userId: string) {
    return prisma.organizationMember.findMany({
      where: {
        userId,
        status: MemberStatus.ACTIVE
      },
      include: {
        organization: true
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });
  }

  static async getOrganizationById(organizationId: string, userId: string) {
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE
      },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true
              }
            },
            apis: true,
            _count: {
              select: {
                apis: true,
                members: true
              }
            }
          }
        }
      }
    });

    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found or access denied"
      });
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
          in: [OrganizationRole.OWNER, OrganizationRole.ADMIN]
        }
      }
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions to update organization"
      });
    }

    return prisma.organization.update({
      where: { id: organizationId },
      data,
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async checkSlugAvailability(slug: string) {
    const existing = await prisma.organization.findUnique({
      where: { slug }
    });
    return !existing;
  }

  static async generateSlugFromName(name: string) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (!(await this.checkSlugAvailability(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
