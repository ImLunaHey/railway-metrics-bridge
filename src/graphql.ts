import { GraphQLClient } from 'graphql-request';
import { config } from './config';

export const graphqlClient = new GraphQLClient(config.baseUrl, {
  headers: {
    Authorization: `Bearer ${config.token}`,
  },
});
