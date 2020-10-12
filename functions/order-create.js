const faunadb = require('faunadb');
require('dotenv').config();

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context) => {
    /* parse the string body into a useable JS object */
    const data = JSON.parse(event.body);
    console.log("Function `order-create` invoked", data)
    const order = {
        data: data
    };
    /* construct the fauna query */
    return client.query(q.Create(q.Collection('orders'), order))
        .then((response) => {
            console.log("success", response);
            /* Success! return the response with statusCode 200 */
            return {
                statusCode: 200,
                body: JSON.stringify(response)
            };
        }).catch((error) => {
            console.log("error", error);
            /* Error! return the error with statusCode 400 */
            return {
                statusCode: 400,
                body: JSON.stringify(error)
            };
        });
};