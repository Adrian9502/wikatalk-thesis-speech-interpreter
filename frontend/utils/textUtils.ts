export const safeTextRender = (text: any): string => {
  if (typeof text === 'string') {
    return text;
  }
  if (text === null || text === undefined) {
    return '';
  }
  if (typeof text === 'object') {
    // If it's an object, try to extract a text property or stringify it
    if (text.text && typeof text.text === 'string') {
      return text.text;
    }
    // As a last resort, stringify the object (though this might not be ideal)
    return JSON.stringify(text);
  }
  return String(text);
};