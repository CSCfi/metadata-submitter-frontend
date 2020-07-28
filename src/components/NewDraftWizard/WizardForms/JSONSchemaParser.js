import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"

const parse_schema = async schema => {
  try {
    let dereferenced_schema = await $RefParser.dereference(schema)
    delete dereferenced_schema["definitions"]
    const config = {}
    return buildYup(dereferenced_schema, config)
  } catch (error) {
    console.error(error)
  }
}

export default { parse_schema }
