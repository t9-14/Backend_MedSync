import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { DisposalCertificatesService } from './disposal-certificates.service';

@Controller('disposal-certificates')
export class DisposalCertificatesController {
  constructor(private readonly certificatesService: DisposalCertificatesService) {}

  @Get()
  findAll() { return this.certificatesService.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.certificatesService.findOne(id); }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    if (body?.user_id !== undefined) throw new BadRequestException('user_id is taken from the authenticated account');
    return this.certificatesService.create(body, req.user.userId);
  }
}
