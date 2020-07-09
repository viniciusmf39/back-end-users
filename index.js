const express = require('express');

const database = require('./database');

const server = express();

server.use(express.json());

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//variaveis

let nextId = null;

server.get('/', (req, res) => {
    return res.json({
        result: 'API-with-data-base'
    });
})

async function getNextId(req, res, next) {
    await database.query(`SELECT MAX(id) FROM users;`,
        { type: database.QueryTypes.SELECT })
        .then(id => {
            nextId = id[0].max;
            nextId++;
        });

    next();
}

server.get('/users', async (req, res) => {
    let usersList;

    await database.query(`SELECT * FROM users`, { type: database.QueryTypes.SELECT })
        .then(users => {
            usersList = users;
        })
        .catch(error => {
            return res.json(error);
        });

    return res.json({ usersList });
})

server.get('/users/:id', async (req, res) => {

    const { id } = req.params;
    let user;

    await database.query(`SELECT * FROM users WHERE id = ${id}`,
        { type: database.QueryTypes.SELECT })
        .then(userResult => {
            user = userResult;
        })
        .catch(error => {
            return res.json(error);
        })

    return res.json({ user });
})

server.post('/users', getNextId, async (req, res) => {

    let inseriu;
    const { name, age, email, phone } = req.body;

    await database.query(`INSERT INTO users VALUES(${nextId}, '${name}', ${age}, 
    '${email}', '${phone}');`,
        { type: database.QueryTypes.INSERT })
        .then(result => {
            inseriu = result;
        })
        .catch(error => {
            return res.json(error);
        });

    if (inseriu[1]) {
        return res.json({
            result: 'dados inseridos com sucesso'
        });
    } else {
        return res.json({
            result: 'dados não foram inseridos'
        });
    }
})

server.listen(process.env.PORT);