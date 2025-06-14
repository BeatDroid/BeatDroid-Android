const prefixUrl = process.env.EXPO_PUBLIC_BASE_URL || "";
const prefixUrlWithApi = `${prefixUrl.split("://")[1]}/api/v1/`;

export const parsePosterUrl = (url: string) => {
  return url.split(`${prefixUrlWithApi}`)[1];
};

export const parsePosterUrlWithApi = (url: string) => {
  return `${prefixUrl}/api/v1/${url}`;
};

export const searchRegex = /^[\w\s\-_.'()&!?,":;\[\]{}+=@#$%^*~/|\\<>À-ÿĀ-žА-я一-龯]+$/;