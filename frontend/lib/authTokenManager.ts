let userToken: string | null = null;

export const setToken = (token: string | null) => {
  userToken = token;
};

export const getToken = (): string | null => {
  return userToken;
};
