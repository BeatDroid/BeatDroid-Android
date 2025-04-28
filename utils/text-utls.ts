const prefixUrl = process.env.EXPO_PUBLIC_BASE_URL || "";
const prefixUrlWithApi = `${prefixUrl.split("://")[1]}/api/v1/`;

export const parsePosterUrl = (url: string) => {
  return url.split(`${prefixUrlWithApi}`)[1];
};
