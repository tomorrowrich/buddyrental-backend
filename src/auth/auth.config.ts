import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret_key: process.env.JWT_SECRET_KEY,
  expiration_time: process.env.JWT_EXPIRATION_TIME,
}));
