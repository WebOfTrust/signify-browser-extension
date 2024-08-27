import { Operation, SignifyClient } from 'signify-ts'

/**
 * Wait for long running keria operation to become completed
 *
 * Use polling to check the status of the operation every second till max retries are over
 * @async
 * @param {SignifyClient} client Signify Client object
 * @param {Operation} [op] long running keria operation
 * @param {number} [maxRetries] Number of max retries, after which error will be thrown. Defaults to 30
 * @param {number} [delay] Delay in ms between retries, Defaults to 1000
 *
 */
export async function waitOperation<T>(
  client: SignifyClient,
  op: Operation<T>,
  maxRetries: number = 30,
  delay: number = 1000
): Promise<Operation<T>> {
  const start = Date.now()
  while (maxRetries-- > 0) {
    op = await client.operations().get(op.name)
    if (op.done === true) return op

    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error(
    `Operation ${op.name} timed out after ${Date.now() - start}ms`
  )
}

export function parseSchemaEdgeOrRuleSection(schemaSection: any): any {
  if (!schemaSection) {
    return null
  }
  const findObjectInOneOf = (oneOfArray: any[]) => {
    return oneOfArray.find((item: any) => item.type === 'object')
  }

  const parseProperties = (properties: any) => {
    let parsedObject: any = {}

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        let field = properties[key]

        // Handle oneOf inside the properties
        if (field.oneOf) {
          const objectInOneOf = findObjectInOneOf(field.oneOf)
          if (objectInOneOf) {
            // Recursive call to handle nested properties within oneOf
            parsedObject[key] = parseProperties(objectInOneOf.properties)
          } else {
            parsedObject[key] = field.oneOf[0]
          }
        } else if (field.type === 'object') {
          parsedObject[key] = parseProperties(field.properties)
        } else {
          parsedObject[key] = {
            description: field.description,
            type: field.type,
            ...(field.const && { const: field.const })
          }
        }
      }
    }

    return parsedObject
  }

  if (schemaSection?.oneOf) {
    const properties = schemaSection?.oneOf?.find(
      (item: any) => item.type === 'object'
    )?.properties

    if (properties) {
      return parseProperties(properties)
    }
  } else if (schemaSection?.properties) {
    const properties = schemaSection?.properties
    return parseProperties(properties)
  } else {
    const properties = schemaSection?.properties
    if (properties) {
      return parseProperties(properties)
    }
    if (
      schemaSection &&
      typeof schemaSection === 'object' &&
      schemaSection.type === 'string'
    ) {
      return schemaSection.hasOwnProperty('const')
        ? schemaSection.const
        : undefined
    }
  }

  return undefined
}

export const formatAsCredentialEdgeOrRuleObject = (
  schemaSectionObject: any
) => {
  if (
    !schemaSectionObject ||
    (typeof schemaSectionObject === 'object' &&
      Object.keys(schemaSectionObject).length === 0)
  ) {
    return null
  }

  const output: any = {}

  const parseNestedSchemaFieldObject = (nestedObject: any) => {
    const nestedOutput: any = {}

    for (const key in nestedObject) {
      if (nestedObject.hasOwnProperty(key)) {
        const subItem = nestedObject[key]

        if (subItem && typeof subItem === 'object') {
          if ('type' in subItem) {
            nestedOutput[key] = parseSchemaFieldObject(subItem)
          } else {
            nestedOutput[key] = parseNestedSchemaFieldObject(subItem)
          }
        }
      }
    }

    return nestedOutput
  }

  if (typeof schemaSectionObject === 'string' && schemaSectionObject) {
    return schemaSectionObject
  } else {
    for (const key in schemaSectionObject) {
      if (schemaSectionObject.hasOwnProperty(key)) {
        const fieldItem = schemaSectionObject[key]
        if (fieldItem && typeof fieldItem === 'object') {
          if ('type' in fieldItem) {
            output[key] = parseSchemaFieldObject(fieldItem)
          } else {
            output[key] = parseNestedSchemaFieldObject(fieldItem)
          }
        }
      }
    }
  }

  return output
}

const parseSchemaFieldObject = (item: any) => {
  if (item && typeof item === 'object' && item.type === 'string') {
    return item.hasOwnProperty('const') ? item.const : ''
  }
  return {}
}

export const getSchemaFieldOfEdge = (edgeObj: any) => {
  if (!edgeObj) {
    return null
  }

  for (const key in edgeObj) {
    if (edgeObj.hasOwnProperty(key)) {
      if (edgeObj[key].hasOwnProperty('s')) {
        return edgeObj[key]['s']
      }
    }
  }
  return null
}

export const setNodeValueInEdge = (edgeObj: any, nodeSaid: string) => {
  if (!edgeObj) {
    return null
  }

  for (const key in edgeObj) {
    if (edgeObj[key].hasOwnProperty('n')) {
      edgeObj[key]['n'] = nodeSaid
    }
  }
  return edgeObj
}
