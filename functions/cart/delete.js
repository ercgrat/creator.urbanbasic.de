/* Import faunaDB sdk */
const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
    timeout: 30,
});

exports.handler = async (event) => {
    const id = event.id;
    const itemId = event.itemId;
    const cart = JSON.parse(event.body);
    console.log(`Function 'delete' invoked. delete id: ${id}`);

    return client
        .query(q.Delete(q.Ref(q.Collection('cart_items'), itemId)), {
            queryTimeout: 30000,
        })
        .then(() => {
            return client.query(
                q.Update(q.Ref(q.Collection('carts'), id), { data: cart })
            );
        })
        .then((response) => {
            console.log('success');
            return {
                statusCode: 200,
                body: JSON.stringify(response),
            };
        })
        .catch((error) => {
            console.log('error', error);
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
        });
};
