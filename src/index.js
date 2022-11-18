import express, { json } from 'express';
import cors from 'cors';
import joi from 'joi';
import authRouter from './routes/authRouter.js';
import statementRouter from './routes/statementRouter.js';
import { sessions, users } from './database/db.js';

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


// DEBUG ===============================================================================
app.delete('/sessions', async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.sendStatus(401);

  try {
    const {deletedCount} = await sessions.deleteOne({token});
    if (!deletedCount) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

app.get('/users', async (req, res) => {
  try {
    const allUsers = await users.find().toArray();
    res.status(200).send(allUsers);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const allUsers = await sessions.find().toArray();
    res.status(200).send(allUsers);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

// ====================================================================================

app.listen(port, () => {
  console.log('Server running at port ' + port);
});