export default () => ({
  statusCode: 200,
  body: JSON.stringify({
    COGNITO_USER_POOL_ID: process.env.USER_POOL_ID,
    COGNITO_USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID,
    COGNITO_USER_POOL_SIGN_IN_URL: process.env.USER_POOL_SIGN_IN_URL,
  }),
});
