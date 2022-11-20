import bcrypt from 'bcrypt';
import { stripHtml } from 'string-strip-html';
import { v4 as uuid } from 'uuid';
import { sessions, users } from "../database/db.js";


export async function signupPost(req, res) {
  const { name, email, password } = req.user;
  const user = {
    name: stripHtml(name).result.trim(),
    email: stripHtml(email).result.trim(),
    password: stripHtml(password).result.trim(),
  }

  try {
    const userFound = await users.findOne({email: user.email});
    if (userFound) {
      return res.status(409).send({message: "Esse email já existe"});
    }

    const hashPassword = bcrypt.hashSync(user.password, 10);
    await users.insertOne({...user, password: hashPassword});
    res.sendStatus(201);

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

export async function loginPost (req, res) {
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
}
