import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import { sessions, statement, users } from "../database/db.js";

export async function statementGet(req, res) {
  const { token } = req;

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
  const { token } = req;

  const { type, value, desc } = req.data;
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