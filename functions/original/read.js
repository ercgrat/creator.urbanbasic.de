/* Import faunaDB sdk */
const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
});

exports.handler = async (event) => {
    const idArray = event.id.split(',');
    console.log(`Function 'read' invoked with id: ${idArray}`);

    return client
        .query(
            q.Map(
                idArray,
                q.Lambda(
                    'original',
                    q.Get(q.Ref(q.Collection('originals'), q.Var('original')))
                )
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
