import { validateEnv, ServerEnv } from './validation/env';

export type Env = ServerEnv;

export function getEnv(): Env {
  return validateEnv();
}

export const env = getEnv();
