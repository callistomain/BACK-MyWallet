import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import dayjs from 'dayjs';
dotenv.config();

// Express
const port = 5000;
const app = express();
app.use(json());
app.use(cors());

// Client connection
const client = new MongoClient(process.env.MONGO_URI);
try {
  await client.connect();
  console.log('MongoDB connected!');
} catch (err) {
  console.log('err.message');
}

// MongoDB
const db = client.db('myWalletTest');
const users = db.collection("users");
const statement = db.collection("statement");
const sessions = db.collection("sessions");

// Schemas
// > { name, email, password }
const userSchema = joi.object({
  name: joi.string().required().min(3),
  email: joi.string().required().min(3),
  password: joi.string().required().min(3)
});

const dataSchema = joi.object({
  type: joi.string().valid("income", "outcome").required(),
  value: joi.number().required(),
  desc: joi.string().required()
});

// [POST] /sign-up ======================================================================
app.post('/sign-up', async (req, res) => {
  const user = req.body;

  try {
    const userFound = await users.findOne({email: user.email});
    if (userFound) {
      return res.status(409).send({message: "Esse email já existe"});
    }

    const data = req.body;
    const {error} = userSchema.validate(user, {abortEarly: false});
    if (error) {
      const message = error.details.map(e => e.message);
      console.log('Error: ' + message);
      return res.status(422).send(message);
    }

    const hashPassword = bcrypt.hashSync(user.password, 10);
    await users.insertOne({...user, password: hashPassword});
    res.sendStatus(201);

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

// [POST] /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const token = uuid();

  try {
    const user = await users.findOne({email});
    if (!user) return res.status(401).send({message: "Email incorreto."});

    const passwordOk = bcrypt.compareSync(password, user.password);
    if (!passwordOk) return res.status(401).send({message: "Senha incorreta."});

    const userSession = await sessions.findOne({userId: user._id});
    if (userSession) {
      return res.status(401)
      .send({message: "Você já está logado, saia para logar novamente."});
    }

    await sessions.insertOne({token, userId: user._id});
    delete user.password;
    res.send({...user, token});

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

// [GET] /statement =====================================================================
app.get('/statement', async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.sendStatus(401);

  try {
    const session = await sessions.findOne({token});
    const user = await users.findOne({_id: session?.userId});
    if (!user) return res.sendStatus(401);

    const {userId} = session;
    const userStatement = await statement.find({userId}).toArray();
    res.send(userStatement);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

// [POST] /statement
app.post('/statement', async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.sendStatus(401);

  const data = req.body;
  const {error} = dataSchema.validate(data, {abortEarly: false});
  if (error) {
    const message = error.details.map(e => e.message);
    console.log('Error: ' + message);
    return res.status(422).send(message);
  }

  try {
    const {userId} = await sessions.findOne({token});
    const fullStatement = { ...data,
      userId,
      date: dayjs().format("DD/MM/YY"),
    }
    await statement.insertOne(fullStatement);
    res.sendStatus(200);

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
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