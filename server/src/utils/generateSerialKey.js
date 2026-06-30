/**
 * Generate a fake serial key like NXPY-A1B2-C3D4-E5F6-G7H8
 */
function generateSerialKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];

  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return `NXPY-${segments.join('-')}`;
}

module.exports = generateSerialKey;
