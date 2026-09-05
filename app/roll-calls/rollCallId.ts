export function encodeRollCallId(id: string) {
  try {
    return encodeURIComponent(decodeURIComponent(id));
  } catch (error) {
    if (error instanceof URIError) {
      return encodeURIComponent(id);
    }

    throw error;
  }
}
