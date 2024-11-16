import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

// export const GET = await handleAuth();

export const GET = await handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
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
