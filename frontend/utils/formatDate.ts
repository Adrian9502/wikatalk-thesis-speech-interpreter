// Format date to be more readable
export const formatDate = (dateString?: string): string => {
  // Handle undefined, null or empty strings
  if (!dateString) {
    return "Not available";
  }

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    // Return a fallback value instead of throwing an error
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
