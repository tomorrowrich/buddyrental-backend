import { ApiProperty } from "@nestjs/swagger";

export class AuthLogoutRequestDto {
    @ApiProperty({example: "331541d6-617d-4464-b7d0-9b346b87f41c"})
    user_id: string

    @ApiProperty({example: "SESH-01030525"})
    session_id: string;
}

export class AuthLogoutResponseDto {
    success: boolean;
    data: any;
    message: string;
}