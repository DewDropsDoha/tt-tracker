import { getAccessToken } from '@auth0/nextjs-auth0';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface DecodedJwtPayload extends JwtPayload {
  permissions: string[];
}

export const getUserPermissions = async () => {
  const { accessToken } = await getAccessToken();

  if (accessToken) {
    const decodedToken = jwtDecode<DecodedJwtPayload>(accessToken);
    return decodedToken?.permissions || [];
  }

  return [];
};
