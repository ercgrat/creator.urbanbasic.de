const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
});

exports.handler = async (event) => {
    const request = JSON.parse(event.body);
    console.log('Function `create` invoked', request);
    const order = {
        data: request.data,
    };

    return client
        .query(
            q.Update(
                q.Ref(q.Collection('orders'), request.ref['@ref'].id),
                order
            )
        )
        .then((response) => {
            return {
                statusCode: 200,
                body: JSON.stringify(response),
            };
        })
        .catch((error) => {
            console.log('error', error);
            return {
                statusCode: 400,
                body: JSON.stringify(error),
            };
        });
};
