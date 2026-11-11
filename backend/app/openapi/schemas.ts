import { ApiProperty, ApiPropertyOptional } from '@foadonis/openapi/decorators'
import { TASK_STATUSES } from '#models/task'

/**
 * Esquemas OpenAPI de la capability `tasks`. Cada clase se publica una sola vez
 * en `components.schemas` con su nombre y las operaciones la referencian por
 * `$ref`. Describen lo que hoy devuelven los transformers y piden los
 * validadores; no los sustituyen ni se usan en tiempo de ejecución.
 */

const STATUSES = [...TASK_STATUSES]

/** Lo que una tarea enseña de su responsable (`TaskAssigneeTransformer`). */
export class TaskAssignee {
  @ApiProperty({ type: 'integer' })
  id!: number

  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Nulo si la cuenta se registró sin nombre.',
  })
  fullName!: string | null

  @ApiProperty({ type: 'string', description: 'Llegan siempre, también sin nombre.' })
  initials!: string
}

/** Una tarea tal como sale en la lista, al crearla y al cambiar su estado (`TaskTransformer`). */
export class Task {
  @ApiProperty({ type: 'integer' })
  id!: number

  @ApiProperty({ type: 'string' })
  title!: string

  @ApiProperty({ enum: STATUSES })
  status!: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: string

  @ApiProperty({ type: () => TaskAssignee })
  assignee!: TaskAssignee
}

/**
 * Una tarea suelta, con su vencimiento resuelto contra el día de quien mira
 * (`TaskDetailTransformer`). La lista no usa este esquema: no lleva vencimiento.
 */
export class TaskDetail {
  @ApiProperty({ type: 'integer' })
  id!: number

  @ApiProperty({ type: 'string' })
  title!: string

  @ApiProperty({ enum: STATUSES })
  status!: string

  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
    description: 'Día del calendario `AAAA-MM-DD`, sin hora. Nulo si la tarea no tiene fecha.',
  })
  dueDate!: string | null

  @ApiProperty({
    type: 'boolean',
    description:
      'Tiene fecha, esa fecha es anterior al día de referencia `today` y la tarea no está `done`.',
  })
  isOverdue!: boolean

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: string

  @ApiProperty({ type: () => TaskAssignee })
  assignee!: TaskAssignee
}

/** Envoltorio `{ data }` que añade `serialize()` a toda respuesta correcta. */
export class TaskResponse {
  @ApiProperty({ type: () => Task })
  data!: Task
}

export class TaskListResponse {
  @ApiProperty({ type: () => [Task] })
  data!: Task[]
}

export class TaskDetailResponse {
  @ApiProperty({ type: () => TaskDetail })
  data!: TaskDetail
}

/** Un error suelto. En los `422` de VineJS trae además el campo y la regla. */
export class ApiErrorItem {
  @ApiProperty({ type: 'string' })
  message!: string

  @ApiPropertyOptional({ type: 'string', description: 'Campo que falla (solo en `422`).' })
  field?: string

  @ApiPropertyOptional({
    type: 'string',
    description: 'Regla de VineJS que falla (solo en `422`).',
  })
  rule?: string

  @ApiPropertyOptional({
    type: 'object',
    description: 'Datos extra de la regla, p. ej. `choices` en un enum.',
  })
  meta?: Record<string, unknown>
}

/** Cuerpo de los `401` (`Unauthorized access`) y de los `422` de validación. */
export class ApiErrorResponse {
  @ApiProperty({ type: () => [ApiErrorItem] })
  errors!: ApiErrorItem[]
}

/** `POST /api/v1/tasks`. Cualquier otro campo del cuerpo se ignora. */
export class CreateTaskBody {
  @ApiProperty({
    type: 'string',
    minLength: 1,
    maxLength: 200,
    description: 'Se recortan los espacios de los extremos antes de validar la longitud.',
  })
  title!: string
}

/** `PATCH /api/v1/tasks/:id/status`. */
export class UpdateTaskStatusBody {
  @ApiProperty({ enum: STATUSES })
  status!: string
}

/** `PUT /api/v1/tasks/:id/due-date`. */
export class SetTaskDueDateBody {
  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
    description: '`AAAA-MM-DD` para fijar o cambiar la fecha; `null` para quitarla.',
  })
  dueDate!: string | null

  @ApiProperty({
    type: 'string',
    format: 'date',
    description:
      'Día de referencia `AAAA-MM-DD` de quien pide, para resolver `isOverdue` en la respuesta.',
  })
  today!: string
}
