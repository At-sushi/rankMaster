'use strict';

const express = require('express');
const app = express();

const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/myDB';
const client = new MongoClient(uri);

async function run() {
    try {
        const database = client.db('rankMaster');

        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log('listening on port ${port}...'));

        // dummy
        app.get('/', (req, res) => {
            res.send('Simple REST API');
        });

        // 取得
        app.get('/:game', (req, res) => {
            const scores = database.collection(req.params.game);
            // 降順ソート
            const query = {};
            const sort = { $sort: { score: -1 } };
            const limit = 10;
            const skip = 0;

            // query
            const cursor = scores.find(query).sort(sort).limit(limit).skip(0);
            for await (const record of cursor) {
                res.send(record);
            }
        })

        // スコア登録
        app.post('/:game/:score', (req, res) => {
            const scores = database.collection(req.params.game);
            const record = {
                name: req.params.name,
                date: req.params.date,
                score: req.params.score
            };

            scores.insertOne(record);
        });
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
