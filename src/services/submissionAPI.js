//@flow
import { create } from "apisauce"

const validate_api = create({ baseURL: "/validate" })

const ValidateXMLFile = async (objectType: string, XMLFile: Object) => {
  let formData = new FormData()
  formData.append(objectType, XMLFile)
  return await validate_api.post(formData)
}

export default { ValidateXMLFile }
