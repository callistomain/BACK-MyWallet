import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import { sessions, statement, users } from "../database/db.js";
import { ObjectId } from "mongodb";

export async function statementGet(req, res) {
  const { token } = req.locals;

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
}

export async function statementPost(req, res) {
  const { token } = req.locals;

  const { type, value, desc } = req.locals.data;
  const data = {
    type: stripHtml(type).result.trim(),
    value: stripHtml(value).result.trim(),
    desc: stripHtml(desc).result.trim(),
  }

  try {
    const {userId} = await sessions.findOne({token});
    const fullStatement = {
      ...data,
      userId,
      date: dayjs().format("DD/MM/YY"),
    }
    await statement.insertOne(fullStatement);
    res.sendStatus(200);

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

export async function statementPut(req, res) {
  const { id } = req.params;

  const { type, value, desc } = req.locals.data;
  const data = {
    type: stripHtml(type).result.trim(),
    value: stripHtml(value).result.trim(),
    desc: stripHtml(desc).result.trim(),
  }

  try {
    await statement.updateOne({_id: ObjectId(id)}, {$set: data});
    res.sendStatus(200);

  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

export async function statementDelete(req, res) {
  const { token } = req.locals;
  const { id } = req.params;

  try {
    const session = await sessions.findOne({token});
    const user = await users.findOne({_id: session?.userId});
    if (!user) return res.sendStatus(401);

    const foundStatement = await statement.findOne(new ObjectId(id));
    if (!foundStatement) return res.sendStatus(404);

    await statement.deleteOne(foundStatement);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}

export async function sessionDelete (req, res) {
  const { token } = req.locals;

  try {
    const {deletedCount} = await sessions.deleteOne({token});
    if (!deletedCount) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
}
