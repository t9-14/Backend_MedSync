import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Post()
  create(@Body() user: any) { return this.usersService.create(user); }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: any) { return this.usersService.update(+id, user); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.usersService.remove(+id); }
}