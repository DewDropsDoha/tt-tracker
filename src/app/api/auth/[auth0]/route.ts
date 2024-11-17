import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

// export const GET = await handleAuth();

export const GET = await handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      redirect_uri: process.env.AUTH0_BASE_URL,
    },
    // returnTo: '/',
  }),
  //   signup: handleLogin({
  //     authorizationParams: {
  //       screen_hint: 'signup',
  //     },
  //     returnTo: '/',
  //   }),
});
