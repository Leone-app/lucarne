import { Router } from 'express';
import type { AppState } from '../types';
import { createConfigRouter } from './config';
import { createSessionRouter } from './session';
import { createBrowseRouter } from './browse';

export function createApiRouter(state: AppState): Router {
  const router = Router();
  router.use(createConfigRouter(state));
  router.use(createSessionRouter(state));
  router.use(createBrowseRouter(state));
  return router;
}
