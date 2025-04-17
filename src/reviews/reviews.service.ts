import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { PaginatedOutputDto } from '@app/interfaces/paginated-output.dto';
import { Prisma, Review } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    const detail = await this.prisma.reservationRecord.findUnique({
      where: { reservationId: createReviewDto.reservationId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            email: true,
            phoneNumber: true,
            citizenId: true,
            address: true,
          },
        },
        buddy: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                email: true,
                phoneNumber: true,
                citizenId: true,
                address: true,
              },
            },
            tags: true,
          },
        },
      },
    });

    if (!detail) {
      throw new InternalServerErrorException();
    }

    return await this.prisma.review.create({
      data: {
        commenterId: detail.userId,
        profileId: detail.buddyId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
  }

  async findAll(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<Review>> {
    const paginate = createPaginator({ perPage, page });
    // equivalent to paginating `this.prisma.review.findMany();`
    const reviews = await paginate<Review, Prisma.ReviewFindManyArgs>(
      this.prisma,
    );
    return reviews;
  }

  async findOnProfile(
    id: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<Review>> {
    const paginate = createPaginator({ perPage, page });

    // equivalent to paginating `this.prisma.review.findMany(...)`
    const profileReviews = await paginate<Review, Prisma.ReviewFindManyArgs>(
      this.prisma,
      {
        where: { profileId: id },
      },
    );
    return profileReviews;
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
}
