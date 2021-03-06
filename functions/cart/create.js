const faunadb = require('faunadb');

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
    timeout: 30,
});

/* export our lambda function as named "handler" export */
exports.handler = async (event) => {
    /* parse the string body into a useable JS object */
    console.log('Function `create` invoked');
    const item = {
        data: {
            s3KeyCounter: 0,
            itemIds: [],
        },
    };
    /* construct the fauna query */
    return client
        .query(q.Create(q.Collection('carts'), item))
        .then((response) => {
            console.log('success');
            /* Success! return the response with statusCode 200 */
            return {
                statusCode: 200,
                body: JSON.stringify(response),
            };
        })
        .catch((error) => {
            console.log('error', error);
            /* Error! return the error with statusCode 400 */
            return {
                statusCode: 400,
                body: JSON.stringify(error),
            };
        });
};
