/**
 * Generate a unique order number like NXP-A1B2C3-1234
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NXP-${timestamp}-${random}`;
}

module.exports = generateOrderNumber;
