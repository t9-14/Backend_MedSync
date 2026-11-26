import { BadRequestException, ConflictException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

type DatabaseError = { code?: string; message?: string };

export function throwDatabaseError(error: DatabaseError): never {
  const message = error.message ?? '';
  if (error.code === '42501') throw new ForbiddenException(message || 'You do not have permission to perform this action');
  if (error.code === 'P0002' || error.code === 'PGRST116') throw new NotFoundException(message || 'Record not found');
  if (error.code === '23505') throw new ConflictException('A record with these details already exists');
  if (error.code === '22023' || error.code === '23514' || error.code === '22P02') throw new BadRequestException(message || 'The request data is invalid');
  throw new InternalServerErrorException('The database request could not be completed');
}
