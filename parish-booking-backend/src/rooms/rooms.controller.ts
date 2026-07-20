import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  // Public: booking form and display screen both need the room list.
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.roomsService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  // Public: today's (or a given day's) approved bookings for one room.
  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date?: string) {
    return this.roomsService.availability(id, date);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.roomsService.deactivate(id);
  }
}
