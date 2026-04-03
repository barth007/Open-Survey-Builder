import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-replace-in-production';
const payload = { userId: 'test-user-id' };
const token = jwt.sign(payload, secret);
const redactedSecret = secret.length <= 8
  ? '[redacted]'
  : `${secret.slice(0, 4)}...${secret.slice(-4)}`;

console.log('--- JWT Debug ---');
console.log('Secret used for signing:', redactedSecret);
console.log('Generated Token:', token);

try {
  const decoded = jwt.verify(token, secret);
  console.log('Verification Success:', decoded);
} catch (e) {
  console.log('Verification Failed:', e.message);
}
