import { AccountType } from "../interfaces/account_type.user.interface";

export interface AuthRegisterRequestDto {
    account_type: AccountType,
    email: string,
    password: string
}

export interface AuthRegisterResponseDto {
    success: boolean,
    data: any,
    message: string
}