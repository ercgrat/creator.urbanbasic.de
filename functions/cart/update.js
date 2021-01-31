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
    const { s3KeyCounter, itemIds } = JSON.parse(event.body);
    const id = event.id;
    console.log(`Function 'update' invoked. update id: ${id}`);

    // Replace the cart value
    return client
        .query(
            q.Update(q.Ref(q.Collection('carts'), id), {
                data: {
                    s3KeyCounter,
                    itemIds,
                },
            }),
            {
                queryTimeout: 30000,
            }
        )
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
