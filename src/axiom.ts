import { Axiom } from '@axiomhq/js';
import { config } from './config';

export const axiom = new Axiom({
  token: config.axiomToken!,
  orgId: config.axiomOrgId,
});
