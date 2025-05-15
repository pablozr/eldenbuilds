import { prisma } from "@/lib/prisma";
import { BuildSortOption } from "@/lib/types";

export type BuildFilters = {
  page?: number;
  limit?: number;
  sort?: BuildSortOption;
  buildType?: string;
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  stats?: string[];
  username?: string;
};

/**
 * Função para buscar builds com filtros
 * Usada diretamente em server components
 */
export async function getBuilds({
  page = 1,
  limit = 10,
  sort = 'newest' as BuildSortOption,
  buildType,
  search,
  minLevel,
  maxLevel,
  stats,
  username,
}: BuildFilters) {
  try {
    // Construir a query
    const where: any = {
      isPublished: true,
    };

    // Filtrar por tipo de build
    if (buildType) {
      where.buildType = buildType;
    }

    // Filtrar por nível
    if (minLevel !== undefined) {
      where.level = {
        ...where.level,
        gte: minLevel,
      };
    }

    if (maxLevel !== undefined) {
      where.level = {
        ...where.level,
        lte: maxLevel,
      };
    }

    // Filtrar por nome de usuário
    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (user) {
        where.userId = user.id;
      } else {
        // Se o usuário não existir, retornar resultados vazios
        return {
          builds: [],
          totalPages: 0,
          currentPage: page,
          totalBuilds: 0,
        };
      }
    }

    // Filtrar por termo de busca
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtrar por estatísticas
    if (stats && stats.length > 0) {
      const statsFilters: any[] = [];

      stats.forEach((stat) => {
        const [name, value] = stat.split(':');
        if (name && value) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            statsFilters.push({
              [name]: {
                gte: numValue,
              },
            });
          }
        }
      });

      if (statsFilters.length > 0) {
        where.AND = statsFilters;
      }
    }

    // Definir a ordenação
    let orderBy: any = {};

    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = {
          likes: {
            _count: 'desc',
          },
        };
        break;
      case 'level_asc':
        orderBy = { level: 'asc' };
        break;
      case 'level_desc':
        orderBy = { level: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Calcular o offset para paginação
    const skip = (page - 1) * limit;

    // Buscar as builds
    const builds = await prisma.build.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    });

    // Contar o total de builds
    const totalBuilds = await prisma.build.count({ where });

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalBuilds / limit);

    return {
      builds: builds.map(build => ({
        ...build,
        createdAt: build.createdAt ? build.createdAt.toISOString() : '',
        updatedAt: build.updatedAt ? build.updatedAt.toISOString() : '',
      })),
      totalPages,
      currentPage: page,
      totalBuilds,
    };
  } catch (error) {
    console.error("Error fetching builds:", error);
    return {
      builds: [],
      totalPages: 0,
      currentPage: page,
      totalBuilds: 0,
    };
  }
}
