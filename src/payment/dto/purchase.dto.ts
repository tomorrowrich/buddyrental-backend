import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class PurchaseDto {
  @ApiProperty({
    description: 'Type of purchase',
    enum: ['coin'],
    example: 'coin',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Amount to purchase',
    example: 1000,
  })
  @IsNotEmpty()
  @IsInt()
  amount: number;

  @ApiProperty({
    description: 'Redirect URL after purchase',
    example: 'https://example.com/success',
  })
  @IsUrl()
  @IsNotEmpty()
  redirectUrl: string;

  // @ApiProperty({
  //   description: 'Coupon code for discount',
  //   required: false,
  // })
  // couponCode?: string;

  // subscription?: boolean;
  // allowInfoSharing?: boolean;
}
