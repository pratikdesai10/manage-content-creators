import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatorService } from './creator.service';

@ApiTags('creators')
@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  // TODO: GET /creators
  // TODO: GET /creators/:id
  // TODO: PATCH /creators/:id
  // TODO: DELETE /creators/:id
}
