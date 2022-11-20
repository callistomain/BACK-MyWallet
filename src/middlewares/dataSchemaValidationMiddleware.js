import { dataSchema } from "../index.js";

export async function dataSchemaValidation(req, res, next) {
  const data = req.body;
  const {error} = dataSchema.validate(data, {abortEarly: false});
  if (error) {
    const message = error.details.map(e => e.message);
    console.log('Error: ' + message);
    return res.status(422).send(message);
  }

  req.locals.data = data;
  next();
}