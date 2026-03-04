export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
});
