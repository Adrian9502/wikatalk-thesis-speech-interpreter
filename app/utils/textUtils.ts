export const safeTextRender = (text: any): string => {
  if (typeof text === 'string') {
    return text;
  }
  if (text === null || text === undefined) {
    return '';
  }
  if (typeof text === 'object') {
    // If it's an object with a text property
    if (text.text && typeof text.text === 'string') {
      return text.text;
    }
    // If it's an object with other string properties
    if (text.label && typeof text.label === 'string') {
      return text.label;
    }
    if (text.value && typeof text.value === 'string') {
      return text.value;
    }
    // Last resort - stringify but log warning
    console.warn('safeTextRender: Converting object to string:', text);
    return JSON.stringify(text);
  }
  return String(text);
};