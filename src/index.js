import express, { json } from 'express';
import cors from 'cors';
import joi from 'joi';
import authRouter from './routes/authRouter.js';
import statementRouter from './routes/statementRouter.js';
// import { sessions, users } from './database/db.js';

// Express
const port = 5000;
const app = express();
app.use(json());
app.use(cors());
app.use(authRouter);
app.use(statementRouter);

// Schemas
export const userSchema = joi.object({
  name: joi.string().required().min(3),
  email: joi.string().required().min(3),
  password: joi.string().required().min(3)
});

export const dataSchema = joi.object({
  type: joi.string().valid("income", "outcome").required(),
  value: joi.number().required(),
  desc: joi.string().required()
});

app.listen(port, () => {
  console.log('Server running at port ' + port);
});