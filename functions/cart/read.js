/* Import faunaDB sdk */
const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
    timeout: 30,
});

exports.handler = async (event) => {
    const id = event.id;
    console.log(`Function 'read' invoked. Read id: ${id}`);
    return client
        .query(q.Get(q.Ref(q.Collection('carts'), id)))
        .then((response) => {
            console.log('success', response);
            return {
                statusCode: 200,
                body: JSON.stringify(response),
            };
        })
        .catch((error) => {
            console.log('error', error);
            return {
                statusCode: error.requestResult.statusCode,
                body: JSON.stringify(error),
            };
        });
};
