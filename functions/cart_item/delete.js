/* Import faunaDB sdk */
const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
    timeout: 30,
});

/**
 *  TODO: This operation can result in the deletion of cart items, which have associated original images.
 *        The associated documents in the originals collection will not be deleted, which is a memory leak of sorts.
 **/
exports.handler = async (event) => {
    const id = event.id;
    console.log(`Function 'delete' invoked. delete id: ${id}`);

    return client
        .query(q.Delete(q.Ref(q.Collection('cart_items'), id)), {
            queryTimeout: 30000,
        })
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
                statusCode: 500,
                body: JSON.stringify(error),
            };
        });
};
