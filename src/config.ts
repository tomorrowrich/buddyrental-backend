export default () => ({
  site_url: process.env.SITE_URL || 'https://example.com',
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
  mailer: {
    from: process.env.MAIL_FROM || 'buddyrental@example.com',
    host: process.env.MAIL_TRANSPORT || 'smtp://smtp.example.com',
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY || '',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.STRIPE_CURRENCY || 'thb',
  },
});
