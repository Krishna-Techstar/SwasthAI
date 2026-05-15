import { Controller, Get, Param, Query } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types';
import { PatientsService } from './patients.service';
import { SearchPatientsDto } from './dto/search-patients.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @Get('search')
  search(@Query() query: SearchPatientsDto, @CurrentUser() user: AuthUser) {
    return this.patients.search(query, user);
  }

  @Get(':id/context')
  getContext(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.patients.getContext(id, user);
  }
}
