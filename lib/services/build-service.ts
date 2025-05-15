import { prisma } from '@/lib/prisma';
import { BuildFormValues } from '@/lib/validations/build';
import { Prisma } from '@prisma/client';

export type BuildFilter = {
  search?: string;
  buildType?: string;
  minLevel?: number;
  maxLevel?: number;
  userId?: string;
  isPublished?: boolean;
  stats?: string[];
};

export type BuildSortOption = 'newest' | 'oldest' | 'popular' | 'comments';

export type BuildPagination = {
  page: number;
  limit: number;
};

export type BuildsResponse = {
  builds: any[];
  totalPages: number;
  currentPage: number;
  totalBuilds: number;
};

/**
 * Serviço para gerenciar builds
 */
export const buildService = {
  /**
   * Busca todas as builds com filtros, ordenação e paginação
   */
  async getBuilds(
    filter: BuildFilter = {},
    sort: BuildSortOption = 'newest',
    pagination: BuildPagination = { page: 1, limit: 10 }
  ): Promise<BuildsResponse> {
    // Calcula o número de itens a pular para paginação
    const skip = (pagination.page - 1) * pagination.limit;

    // Constrói o filtro para a consulta
    const where: Prisma.BuildWhereInput = {
      isPublished: filter.isPublished ?? true,
    };

    // Adiciona filtro por tipo de build se especificado
    if (filter.buildType) {
      where.buildType = filter.buildType;
    }

    // Adiciona filtro por nível se especificado
    if (filter.minLevel !== undefined) {
      where.level = {
        ...(typeof where.level === 'object' && where.level !== null ? where.level : {}),
        gte: filter.minLevel,
      };
    }

    if (filter.maxLevel !== undefined) {
      where.level = {
        ...(typeof where.level === 'object' && where.level !== null ? where.level : {}),
        lte: filter.maxLevel,
      };
    }

    // Adiciona filtro por usuário se especificado
    if (filter.userId) {
      where.userId = filter.userId;
    }

    // Adiciona filtro de busca por título ou descrição se especificado
    if (filter.search) {
      where.OR = [
        {
          title: {
            contains: filter.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filter.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Adiciona filtros avançados por estatísticas
    if (filter.stats && filter.stats.length > 0) {
      const statFilters: Prisma.BuildWhereInput[] = [];

      filter.stats.forEach(stat => {
        switch (stat) {
          case 'high-vigor':
            statFilters.push({ vigor: { gte: 40 } });
            break;
          case 'high-strength':
            statFilters.push({ strength: { gte: 40 } });
            break;
          case 'high-dexterity':
            statFilters.push({ dexterity: { gte: 40 } });
            break;
          case 'high-intelligence':
            statFilters.push({ intelligence: { gte: 40 } });
            break;
          case 'high-faith':
            statFilters.push({ faith: { gte: 40 } });
            break;
          case 'high-arcane':
            statFilters.push({ arcane: { gte: 40 } });
            break;
          case 'balanced':
            // Builds com distribuição equilibrada (diferença máxima de 10 pontos entre as estatísticas principais)
            statFilters.push({
              AND: [
                { strength: { gte: 20 } },
                { dexterity: { gte: 20 } },
                { intelligence: { gte: 20 } },
                { faith: { gte: 20 } },
              ]
            });
            break;
        }
      });

      if (statFilters.length > 0) {
        // Se já existir um OR, precisamos combiná-lo com os novos filtros
        if (where.OR) {
          const existingOr = Array.isArray(where.OR) ? where.OR : [where.OR];
          where.AND = [
            { OR: existingOr },
            { OR: statFilters }
          ];
          delete where.OR;
        } else {
          where.OR = statFilters;
        }
      }
    }

    // Define a ordenação
    let orderBy: Prisma.BuildOrderByWithRelationInput = {};

    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = { likes: { _count: 'desc' } };
        break;
      case 'comments':
        orderBy = { comments: { _count: 'desc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Busca as builds
    const builds = await prisma.build.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy,
      take: pagination.limit,
      skip,
    });

    // Conta o total de builds para calcular a paginação
    const totalBuilds = await prisma.build.count({ where });

    return {
      builds,
      totalPages: Math.ceil(totalBuilds / pagination.limit),
      currentPage: pagination.page,
      totalBuilds,
    };
  },

  /**
   * Busca uma build específica pelo ID
   */
  async getBuildById(id: string) {
    return prisma.build.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  },

  /**
   * Cria uma nova build
   */
  async createBuild(data: BuildFormValues, userId: string) {
    try {
      // Busca o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Prepara os dados para salvar no banco
      // Certifica-se de que os arrays são armazenados corretamente
      const preparedData = {
        ...data,
        userId: user.id,
        // Garante que os arrays são armazenados como arrays no banco de dados
        weapons: Array.isArray(data.weapons) ? data.weapons : [data.weapons].filter(Boolean),
        armor: Array.isArray(data.armor) ? data.armor : [data.armor].filter(Boolean),
        talismans: Array.isArray(data.talismans) ? data.talismans : [data.talismans].filter(Boolean),
        spells: Array.isArray(data.spells) ? data.spells : [data.spells].filter(Boolean),
      };

      // Cria a build
      return await prisma.build.create({
        data: preparedData,
      });
    } catch (error) {
      console.error('Error creating build:', error);

      // Provide more detailed error message
      if (error instanceof Error) {
        if (error.message.includes("Can't reach database server")) {
          throw new Error('Database connection error. Please try again later or contact support.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the build');
    }
  },

  /**
   * Atualiza uma build existente
   */
  async updateBuild(id: string, data: BuildFormValues, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Busca a build
    const build = await prisma.build.findUnique({
      where: { id },
    });

    if (!build) {
      throw new Error('Build not found');
    }

    // Verifica se o usuário é o dono da build
    if (build.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    // Prepara os dados para salvar no banco
    // Certifica-se de que os arrays são armazenados corretamente
    const preparedData = {
      ...data,
      // Garante que os arrays são armazenados como arrays no banco de dados
      weapons: Array.isArray(data.weapons) ? data.weapons : [data.weapons].filter(Boolean),
      armor: Array.isArray(data.armor) ? data.armor : [data.armor].filter(Boolean),
      talismans: Array.isArray(data.talismans) ? data.talismans : [data.talismans].filter(Boolean),
      spells: Array.isArray(data.spells) ? data.spells : [data.spells].filter(Boolean),
    };

    // Atualiza a build
    return prisma.build.update({
      where: { id },
      data: preparedData,
    });
  },

  /**
   * Exclui uma build
   */
  async deleteBuild(id: string, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Busca a build
    const build = await prisma.build.findUnique({
      where: { id },
    });

    if (!build) {
      throw new Error('Build not found');
    }

    // Verifica se o usuário é o dono da build
    if (build.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    // Exclui a build
    return prisma.build.delete({
      where: { id },
    });
  },
};

