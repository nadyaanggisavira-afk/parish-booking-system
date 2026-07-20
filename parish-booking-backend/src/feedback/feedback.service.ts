import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackStatus, FeedbackType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
import { ReplyFeedbackDto } from './dto/reply-feedback.dto';

// Forward-only ordering; a status may only advance, never move back.
const STATUS_ORDER: FeedbackStatus[] = ['new', 'read', 'in_progress', 'done'];

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  create(dto: CreateFeedbackDto, senderId?: string) {
    return this.prisma.feedback.create({
      data: {
        type: dto.type,
        category: dto.category,
        roomId: dto.roomId,
        relatedBookingId: dto.relatedBookingId,
        reporterName: dto.reporterName,
        email: dto.email,
        message: dto.message,
        senderId,
      },
    });
  }

  // Admin-only inbox — newest first, so fresh reports surface at the top.
  findAll(type?: FeedbackType, status?: FeedbackStatus) {
    return this.prisma.feedback.findMany({
      where: { ...(type ? { type } : {}), ...(status ? { status } : {}) },
      include: {
        room: { select: { name: true } },
        sender: { select: { nama: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateFeedbackStatusDto) {
    const existing = await this.prisma.feedback.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Feedback ${id} not found`);

    if (STATUS_ORDER.indexOf(dto.status) < STATUS_ORDER.indexOf(existing.status)) {
      throw new BadRequestException('Status tidak dapat mundur ke tahap sebelumnya');
    }
    return this.prisma.feedback.update({ where: { id }, data: { status: dto.status } });
  }

  // Admin sends a reply → stored, emailed (stub), status advanced. Guarded
  // against a second send so the umat never gets a duplicate email.
  async reply(id: string, dto: ReplyFeedbackDto) {
    const fb = await this.prisma.feedback.findUnique({ where: { id } });
    if (!fb) throw new NotFoundException(`Feedback ${id} not found`);
    if (fb.repliedAt) throw new BadRequestException('Balasan sudah pernah dikirim');

    const to = fb.email;
    if (!to) throw new BadRequestException('Tidak ada alamat email tujuan untuk balasan ini');

    const isSuggestion = fb.type === 'suggestion';
    await this.mail.send({
      to,
      subject: isSuggestion ? 'Tanggapan atas Saran Anda' : 'Tanggapan atas Laporan Anda',
      body: dto.message,
    });

    // Sending a reply advances the workflow: Saran → Selesai, Laporan → Diproses.
    const nextStatus: FeedbackStatus = isSuggestion ? 'done' : 'in_progress';

    return this.prisma.feedback.update({
      where: { id },
      data: { adminReply: dto.message, repliedAt: new Date(), status: nextStatus },
    });
  }
}
