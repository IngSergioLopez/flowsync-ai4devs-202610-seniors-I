/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'openapi.html': {
    methods: ["GET","HEAD"],
    pattern: '/api',
    tokens: [[0,"api"]],
    types: placeholder as Registry['openapi.html']['types'],
  },
  'openapi.json': {
    methods: ["GET","HEAD"],
    pattern: '/api.json',
    tokens: [[0,"api.json"]],
    types: placeholder as Registry['openapi.json']['types'],
  },
  'openapi.yaml': {
    methods: ["GET","HEAD"],
    pattern: '/api.yaml',
    tokens: [[0,"api.yaml"]],
    types: placeholder as Registry['openapi.yaml']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"signup"]],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"logout"]],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'tasks.tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tasks',
    tokens: [[0,"api"],[0,"v1"],[0,"tasks"]],
    types: placeholder as Registry['tasks.tasks.index']['types'],
  },
  'tasks.tasks.store': {
    methods: ["POST"],
    pattern: '/api/v1/tasks',
    tokens: [[0,"api"],[0,"v1"],[0,"tasks"]],
    types: placeholder as Registry['tasks.tasks.store']['types'],
  },
  'tasks.tasks.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tasks/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"tasks"],[1,"id"]],
    types: placeholder as Registry['tasks.tasks.show']['types'],
  },
  'tasks.task_statuses.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/tasks/:id/status',
    tokens: [[0,"api"],[0,"v1"],[0,"tasks"],[1,"id"],[0,"status"]],
    types: placeholder as Registry['tasks.task_statuses.update']['types'],
  },
  'tasks.task_due_dates.update': {
    methods: ["PUT"],
    pattern: '/api/v1/tasks/:id/due-date',
    tokens: [[0,"api"],[0,"v1"],[0,"tasks"],[1,"id"],[0,"due-date"]],
    types: placeholder as Registry['tasks.task_due_dates.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
