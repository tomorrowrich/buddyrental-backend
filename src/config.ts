export default () => ({
  client_key: process.env.CLIENT_KEY || 'DEFAULT_CLIENT_KEY',
  port: parseInt(process.env.PORT || '55500', 10),
  auth: {
    secret_key: process.env.JWT_SECRET_KEY || 'DEFAULT_SECRET_KEY',
    expiration_time: process.env.JWT_EXPIRATION_TIME || '72h',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://user:password@localhost:5432/db',
  },
  storage: {
    url: process.env.S3_URL || 'https://user.supabase.co',
    key: process.env.S3_KEY || 'DEFAULT_ACCESS_KEY',
    bucket: process.env.S3_BUCKET_NAME || 'storage',
  },
});
