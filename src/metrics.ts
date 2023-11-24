import { gql } from 'graphql-request';
import { graphqlClient } from './graphql';
import { config } from './config';
import { axiom } from './axiom';

type Usage = {
  value: number;
  measurement: string;
  tags: Tags;
};

type Tags = {
  projectId: string;
  deploymentId?: string;
  environmentId?: string;
  serviceId?: string;
  volumeId?: string;
};

type EstimatedUsage = {
  estimatedValue: number;
  measurement: string;
  projectId: string;
};

type Me = {
  projects: Projects;
};

type Team = {
  projects: Projects;
};

type Projects = {
  edges: Edge[];
};

type Edge = {
  node: Node;
};

type Node = {
  id: string;
  name: string;
};

const getPersonalUsage = async () => {
  const results = await graphqlClient.request<{
    usage: Usage[];
    estimatedUsage: EstimatedUsage[];
    me: Me;
  }>(
    gql`
      query getPersonalUsage($measurements: [MetricMeasurement!]!) {
        usage(measurements: $measurements) {
          value
          measurement
          tags {
            projectId
            deploymentId
            environmentId
            serviceId
            volumeId
          }
        }
        estimatedUsage(measurements: $measurements) {
          estimatedValue
          measurement
          projectId
        }
        me {
          projects {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
    {
      measurements: ['CPU_USAGE', 'MEMORY_USAGE_GB', 'NETWORK_TX_GB'],
    },
  );

  const projects = results.me.projects.edges.map((edge) => edge.node);
  const usage = results.usage.map((usage) => ({
    ...usage,
    tags: {
      ...usage.tags,
      projectName: projects.find((project) => project.id === usage.tags.projectId)?.name,
    },
  }));
  const estimatedUsage = results.estimatedUsage.map((usage) => ({
    measurement: usage.measurement,
    estimatedValue: usage.estimatedValue,
    tags: {
      projectId: usage.projectId,
      projectName: projects.find((project) => project.id === usage.projectId)?.name,
    },
  }));

  return { usage, estimatedUsage };
};

const getTeamUsage = async (teamId: string) => {
  const results = await graphqlClient.request<{
    usage: Usage[];
    estimatedUsage: EstimatedUsage[];
    team: Team;
  }>(
    gql`
      query getTeamUsage($teamId: String!, $measurements: [MetricMeasurement!]!) {
        usage(measurements: $measurements) {
          value
          measurement
          tags {
            projectId
          }
        }
        estimatedUsage(measurements: $measurements) {
          estimatedValue
          measurement
          projectId
        }
        team(id: $teamId) {
          projects {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
    {
      teamId,
      measurements: ['CPU_USAGE', 'MEMORY_USAGE_GB', 'NETWORK_TX_GB'],
    },
  );

  const projects = results.team.projects.edges.map((edge) => edge.node);
  const usage = results.usage.map((usage) => ({
    ...usage,
    tags: {
      ...usage.tags,
      teamId,
      projectName: projects.find((project) => project.id === usage.tags.projectId)?.name,
    },
  }));
  const estimatedUsage = results.estimatedUsage.map((usage) => ({
    measurement: usage.measurement,
    estimatedValue: usage.estimatedValue,
    tags: {
      teamId,
      projectId: usage.projectId,
      projectName: projects.find((project) => project.id === usage.projectId)?.name,
    },
  }));

  return { usage, estimatedUsage };
};

export const fetchMetrics = async () => {
  try {
    if (config.teamId) {
      const teamUsage = await getTeamUsage(config.teamId);
      axiom.ingest(config.axiomDatasetId, teamUsage.usage);
    }

    const personalUsage = await getPersonalUsage();
    axiom.ingest(config.axiomDatasetId, personalUsage.usage);
  } catch (error: unknown) {
    console.error('Error fetching metrics', error);
  } finally {
    await axiom.flush();
  }
};
