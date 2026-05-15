import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { CheckDrugSafetyDto } from './dto/check-drug-safety.dto';
import { SearchMedicationsDto } from './dto/search-medications.dto';
import { DrugSafetyService } from './drug-safety.service';

@Controller('drug-safety')
export class DrugSafetyController {
  constructor(private readonly drugSafety: DrugSafetyService) {}

  @Get('medications')
  searchMedications(@Query() query: SearchMedicationsDto) {
    return this.drugSafety.searchMedications(query);
  }

  @Post('check')
  check(@Body() dto: CheckDrugSafetyDto, @CurrentUser() user: AuthUser) {
    return this.drugSafety.check(dto, user);
  }
}
