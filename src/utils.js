export const queryString = (obj) => {
    return Object.keys(obj)
      .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
      .join('&');
  };