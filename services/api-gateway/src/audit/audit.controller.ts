import { Controller, Get, Query } from '@nestjs/common';
import { Prisma, Role } from '@swasthai/database';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('logs')
  async logs(@Query() query: PaginationDto, @Query('search') search?: string) {
    const where: Prisma.AuditLogWhereInput = search
      ? {
          OR: [
            { action: { contains: search, mode: 'insensitive' } },
            { entityType: { contains: search, mode: 'insensitive' } },
            { actorEmail: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  @Get('logins')
  async logins(@Query() query: PaginationDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.loginLog.findMany({
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginLog.count(),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }
}
