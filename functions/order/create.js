const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
});

exports.handler = async event => {
    const data = JSON.parse(event.body);
    console.log('Function `create` invoked', data);
    const order = {
        data,
    };

    return client.query(q.Create(q.Collection('orders'), order))
        .then((response) => {
            console.log("success", response);
            return {
                statusCode: 200,
                body: JSON.stringify(response)
            };
        }).catch((error) => {
            console.log("error", error);
            return {
                statusCode: 400,
                body: JSON.stringify(error)
            };
        });
};
