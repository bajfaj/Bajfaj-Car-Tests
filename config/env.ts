export const ENV = process.env.ENV || 'dev';
export const API_URL = ENV === 'dev' ? 'http://localhost:3001' : 'http://localhost:3002';
export const UI_URL = 'http://localhost:5173'; // SAME for dev and test - you were right!

console.log(`>>> ENV=${ENV} | API=${API_URL} | UI=${UI_URL} | DB=${ENV === 'test' ? 'bajfaj_test.db' : 'bajfaj.db'}`);