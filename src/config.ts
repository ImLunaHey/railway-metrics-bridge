const config = {
  baseUrl: 'https://backboard.railway.app/graphql/v2',
  cron: !!process.env.CRON,
  token: process.env.RAILWAY_TOKEN!,
  teamId: process.env.RAILWAY_TEAM_ID,
  axiomToken: process.env.AXIOM_TOKEN,
  axiomOrgId: process.env.AXIOM_ORG_ID,
  axiomDatasetId: process.env.AXIOM_DATASET_ID!,
};

if (!config.token) {
  throw new Error('Missing Railway token https://railway.app/account/tokens');
}

if (!config.axiomToken) {
  throw new Error('Missing Axiom token https://axiom.co/docs/restapi/token#creating-api-token');
}

if (!config.axiomDatasetId) {
  throw new Error('Missing Axiom dataset ID https://axiom.co/docs/query-data/datasets#dataset-overview');
}

export { config };
