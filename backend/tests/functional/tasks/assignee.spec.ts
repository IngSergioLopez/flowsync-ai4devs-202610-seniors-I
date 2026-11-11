import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no filtra
 * datos de cuenta y responsable sin nombre.
 *
 * Cada scenario se comprueba en tres variantes, un test por variante para que
 * un fallo no tape a otro:
 * - crear: `POST /tasks`, lo que ve el responsable al crearla;
 * - una tarea: `GET /tasks/:id`, leída por otra cuenta;
 * - lista: `GET /tasks`, leída por otra cuenta.
 *
 * Decisiones que la spec no fija: «obtener» incluye las tres variantes; las
 * fechas de la cuenta se prueban por el «ningún otro dato» del requisito; el
 * `id` del responsable se tolera; «datos de acceso» = `email` y `password`.
 *
 * Dependencia de otra spec: el valor de las iniciales lo fija la regla de
 * iniciales de la cuenta, no esta. Aquí solo se comprueba que lleguen.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // `GET /tasks/:id` exige el día de quien mira; solo afecta al vencimiento.
  const HOY = '2026-01-15'

  const VARIANTES = ['crear', 'una tarea', 'lista'] as const
  type Variante = (typeof VARIANTES)[number]

  function cuenta(fullName: string | null, email: string) {
    return User.create({ fullName, email, password: 'secreto123' })
  }

  /**
   * Devuelve el `assignee` de una tarea cuyo responsable es `responsable`, tal
   * como llega en la variante pedida. Cada variante llama a un solo endpoint.
   */
  async function assigneeEn(client: any, variante: Variante, responsable: User) {
    if (variante === 'crear') {
      const response = await client
        .post('/api/v1/tasks')
        .json({ title: 'Revisar el informe' })
        .loginAs(responsable)
      response.assertStatus(201)
      return response.body().data.assignee
    }

    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
    const otra = await cuenta('Alan Turing', 'alan@example.com')

    if (variante === 'una tarea') {
      const response = await client.get(`/api/v1/tasks/${task.id}`).qs({ today: HOY }).loginAs(otra)
      response.assertStatus(200)
      return response.body().data.assignee
    }

    const response = await client.get('/api/v1/tasks').loginAs(otra)
    response.assertStatus(200)
    return response.body().data.find((t: { id: number }) => t.id === task.id)?.assignee
  }

  /** Las claves prohibidas que trae el objeto: todas a la vez, no solo la primera. */
  function presentes(objeto: Record<string, unknown>, prohibidas: string[]) {
    return Object.keys(objeto).filter((clave) => prohibidas.includes(clave))
  }

  for (const variante of VARIANTES) {
    test(`el responsable trae su nombre y sus iniciales (${variante})`, async ({
      client,
      assert,
    }) => {
      const ada = await cuenta('Ada Lovelace', 'ada@example.com')

      const assignee = await assigneeEn(client, variante, ada)

      assert.isObject(assignee, 'la tarea no llega con su responsable')
      assert.equal(assignee.fullName, 'Ada Lovelace')
      assert.isString(assignee.initials)
      assert.isNotEmpty(assignee.initials)
    })

    test(`la tarea no expone el email ni datos de acceso del responsable (${variante})`, async ({
      client,
      assert,
    }) => {
      const ada = await cuenta('Ada Lovelace', 'ada@example.com')

      const assignee = await assigneeEn(client, variante, ada)

      assert.isObject(assignee, 'la tarea no llega con su responsable')
      assert.deepEqual(presentes(assignee, ['email', 'password']), [])
      // El email tampoco puede colarse bajo otra clave.
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com')
    })

    test(`la tarea no expone las fechas de la cuenta del responsable (${variante})`, async ({
      client,
      assert,
    }) => {
      const ada = await cuenta('Ada Lovelace', 'ada@example.com')

      const assignee = await assigneeEn(client, variante, ada)

      assert.isObject(assignee, 'la tarea no llega con su responsable')
      assert.deepEqual(presentes(assignee, ['createdAt', 'updatedAt']), [])
    })

    test(`un responsable sin nombre llega con nombre nulo e iniciales (${variante})`, async ({
      client,
      assert,
    }) => {
      const sinNombre = await cuenta(null, 'ada@example.com')

      const assignee = await assigneeEn(client, variante, sinNombre)

      assert.isObject(assignee, 'la tarea no llega con su responsable')
      assert.property(assignee, 'fullName')
      assert.isNull(assignee.fullName)
      assert.isString(assignee.initials)
      assert.isNotEmpty(assignee.initials)
    })
  }
})
