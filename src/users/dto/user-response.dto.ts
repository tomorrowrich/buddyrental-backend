import { UserGender } from '@prisma/client';

export class UserResponseDto {
  userId: string;
  adminId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  citizenId: string;
  phoneNumber: string;
  verified: boolean;
  displayName: string | null;
  gender: UserGender;
  dateOfBirth: Date;
  address: string;
  city: string;
  postalCode: string;
  profilePicture: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
