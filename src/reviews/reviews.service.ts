import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    return await this.prisma.review.create({ data: createReviewDto });
  }

  async findAll() {
    return await this.prisma.review.findMany();
  }

  async findOnProfile(id: string) {
    return await this.prisma.review.findMany({ where: { profileId: id } });
  }

  async findOne(id: number) {
    return await this.prisma.review.findFirstOrThrow({
      where: { reviewId: id },
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    return await this.prisma.review.update({
      where: { reviewId: id },
      data: updateReviewDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.review.delete({ where: { reviewId: id } });
  }

  async hello() {
    return 'OK';
  }
}
