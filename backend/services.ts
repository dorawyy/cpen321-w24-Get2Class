import { MongoClient } from "mongodb";

export const client: MongoClient = new MongoClient(process.env.DB_URI ?? "mongodb://localhost:27017");