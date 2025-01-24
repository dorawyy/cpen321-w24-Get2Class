import express, { Request, Response } from 'express'

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ "data": "Get2Class GET" });
});

app.post('/', (req: Request, res: Response) => {
    res.json({ "data": `Client sent: ${req.body.text}` });
});

app.listen(3000, () => {
    console.log("Listening on port " + 3000)
});