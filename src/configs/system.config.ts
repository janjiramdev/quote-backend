export default () => ({
  system: {
    appPort: Number(process.env.APP_PORT ?? 8080),
    corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN ?? 'http://localhost:3000',
  },
  database: {
    uri: process.env.DATABASE_URI,
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpireTime: process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpireTime: process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME,
  },
});
