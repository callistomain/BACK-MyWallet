import { userSchema } from "../index.js";

export async function userSchemaValidation(req, res, next) {
  const user = req.body;
  const {error} = userSchema.validate(user, {abortEarly: false});
  if (error) {
    const message = error.details.map(e => e.message);
    console.log('Error: ' + message);
    return res.status(422).send(message);
  }

  req.user = user;
  next();
}