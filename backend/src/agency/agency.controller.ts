import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AgencyService } from './agency.service';

@ApiTags('agencies')
@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  // TODO: GET /agencies
  // TODO: GET /agencies/:id
  // TODO: PATCH /agencies/:id
  // TODO: DELETE /agencies/:id
}
