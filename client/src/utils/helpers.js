/**
 * Generate placeholder image URL
 */
export function getPlaceholderImage(width = 600, height = 400) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%2312121a' width='${width}' height='${height}'/%3E%3Ctext fill='%236b6b80' font-family='sans-serif' font-size='20' text-anchor='middle' x='${width/2}' y='${height/2}'%3ENo Image%3C/text%3E%3C/svg%3E`;
}

/**
 * Classify error from API response
 */
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
