import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync API',
      version: '0.0.0',
    },
    components: {
      securitySchemes: {
        // Nombre que usa `@ApiBearerAuth()`. Access tokens opacos del guard `api`.
        bearer: { type: 'http', scheme: 'bearer' },
      },
    },
  },
})
