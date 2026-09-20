// config/env.ts - SINGLE SOURCE OF TRUTH - FIXED
import * as dotenv from 'dotenv';
dotenv.config();

type EnvName = 'dev' | 'test' | 'prod';
type RawEnv = EnvName | 'development' | 'production';

// Allow both short and long forms, normalize to short
const rawEnv = (process.env.ENV || 'dev') as RawEnv;

const envMap: Record<RawEnv, EnvName> = {
  dev: 'dev',
  development: 'dev',
  test: 'test',
  prod: 'prod',
  production: 'prod'
};

export const ENV: EnvName = envMap[rawEnv];

if (!ENV) {
  throw new Error(`Invalid ENV=${rawEnv}. Use dev/test/prod or development/production`);
}

const configs = {
  dev: {
    apiURL: 'http://localhost:3001',
    uiURL: 'http://localhost:5173',
    dbFile: 'bajfaj_dev.db',
  },
  test: {
    apiURL: 'http://localhost:3002',
    uiURL: 'http://localhost:5173',
    dbFile: 'bajfaj_test.db',
  },
  prod: {
    apiURL: 'http://localhost:3000',
    uiURL: 'http://localhost:5173',
    dbFile: 'bajfaj_prod.db',
  },
};

export const env = configs[ENV];

console.log(`>>> ENV=${ENV} (raw=${rawEnv}) | API=${env.apiURL} | UI=${env.uiURL} | DB=${env.dbFile}`);