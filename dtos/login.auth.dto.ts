import { ApiProperty } from "@nestjs/swagger";

export class AuthLoginRequestDto {
    @ApiProperty({example: "331541d6-617d-4464-b7d0-9b346b87f41c"})
    user_id: string

    @ApiProperty({example: "example@example.com"})
    email: string;

    @ApiProperty({example: "gneurshk"})
    password: string;
}

export class AuthLoginResponseDto {
    success: boolean;
    data: {
        session_id: string;
    };
    message: string;
}