import express, { Request, Response } from 'express';
import { MongoClient } from 'mongodb';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ "data": "Get2Class GET" });
});

app.post('/', (req: Request, res: Response) => {
    res.json({ "data": `Client sent: ${req.body.text}` });
});

/**
 * Login related routes
 */
app.get('/find_existing_user', async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const username = query["username"];
        const data = await client.db("get2class").collection("users").findOne({ "username": username });
        res.status(200).json({ "data": data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "err": err });
    }
});

app.post('/create_new_user', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const data = await client.db("get2class").collection("users").insertOne(body);
        res.status(200).json({ "data": "Successfully registered account" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "err": err });
    }
});

const client = new MongoClient("mongodb://localhost:27017/");
client.connect().then(() => {
    console.log("MongoDB Client Connected");

    app.listen(3000, () => {
        console.log("Listening on port " + 3000);
    });
}).catch(err => {
    console.error(err);
    client.close();
})