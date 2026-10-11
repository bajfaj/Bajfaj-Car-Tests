import { mergeTests } from '@playwright/test';
import { test as apiTest } from './api.fixtures';
import { test as uiTest } from './ui.fixtures';

// Merges API + UI - now you have ONE test import for whole project
export const test = mergeTests(apiTest, uiTest);
export { expect } from '@playwright/test';