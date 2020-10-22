const dockerComposeTemplate = `version: '3.6'
services:
  nhost-postgres:
    image: postgres:{{ postgres_version }}
    ports:
      - '{{ postgres_port }}:5432'
    restart: always
    environment:
      POSTGRES_USER: {{ postgres_user }}
      POSTGRES_PASSWORD: {{ postgres_password }}
    volumes:
      - ../db_data:/var/lib/postgresql/data
  nhost-graphql-engine:
    image: hasura/graphql-engine:{{ hasura_graphql_version }}
    ports:
      - '{{ hasura_graphql_port }}:{{ hasura_graphql_port }}'
    depends_on:
      - nhost-postgres
    restart: always
    environment:
      HASURA_GRAPHQL_SERVER_PORT: {{ hasura_graphql_port }}
      HASURA_GRAPHQL_DATABASE_URL: postgres://{{ postgres_user }}:{{ postgres_password }}@nhost-postgres:5432/postgres
      HASURA_GRAPHQL_ENABLE_CONSOLE: 'false'
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
      HASURA_GRAPHQL_ADMIN_SECRET: {{ hasura_graphql_admin_secret }}
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256", "key": "{{ graphql_jwt_key }}"}'
      HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT: 5
      HASURA_GRAPHQL_NO_OF_RETRIES: 5
    env_file:
      - ../{{ env_file }}
    command:
      - graphql-engine
      - serve
    volumes:
      - ../migrations:/hasura-migrations
  nhost-hasura-backend-plus:
    image: nhost/hasura-backend-plus:{{ hasura_backend_plus_version }}
    ports:
      - '{{ hasura_backend_plus_port }}:{{ hasura_backend_plus_port }}'
    depends_on:
    - nhost-graphql-engine
    restart: always
    environment:
      PORT: {{ hasura_backend_plus_port }}
      USER_FIELDS: ''
      USER_REGISTRATION_AUTO_ACTIVE: 'true'
      HASURA_GRAPHQL_ENDPOINT: http://nhost-graphql-engine:{{ hasura_graphql_port }}/v1/graphql
      HASURA_ENDPOINT: http://nhost-graphql-engine:{{ hasura_graphql_port }}/v1/graphql
      HASURA_GRAPHQL_ADMIN_SECRET: {{ hasura_graphql_admin_secret }}
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256", "key": "{{ graphql_jwt_key }}"}'
      AUTH_ACTIVE: 'true'
      AUTH_LOCAL_ACTIVE: 'true'
      REFRESH_TOKEN_EXPIRES: 43200
      JWT_TOKEN_EXPIRES: 15
    env_file:
      - ../{{ env_file }}
`;

function getComposeTemplate() {
  return dockerComposeTemplate;
}

module.exports = getComposeTemplate;
