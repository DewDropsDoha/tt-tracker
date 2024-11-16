import { getAccessToken } from '@auth0/nextjs-auth0';
import { jwtDecode } from 'jwt-decode';

export const getUserPermissions = async () => {
  const { accessToken } = await getAccessToken();

  if (accessToken) {
    const decodedToken = jwtDecode(accessToken);
    // @ts-expect-error There's more in service.spreadsheets.values
    return decodedToken?.permissions || [];
  }

  return [];
};
