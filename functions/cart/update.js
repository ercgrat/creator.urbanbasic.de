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
    const { cart, originals } = JSON.parse(event.body);
    const id = event.id;
    console.log(`Function 'update' invoked. update id: ${id}`);

    if (originals) {
        cart.items[cart.items.length - 1].originals = [];
    }

    return Promise.all(
        // Create originals entries and record ids if originals are provided (add action on the cart)
        originals
            ? originals.map(
                  (original) =>
                      new Promise((resolve, reject) => {
                          return client
                              .query(
                                  q.Create(q.Collection('originals'), {
                                      data: { src: original },
                                  }),
                                  {
                                      queryTimeout: 30000,
                                  }
                              )
                              .then((response) => {
                                  cart.items[
                                      cart.items.length - 1
                                  ].originals.push(response.ref.value.id);
                                  resolve();
                              })
                              .catch((err) => {
                                  reject(err);
                              });
                      })
              )
            : []
    )
        .then(() => {
            // Replace the cart value
            return client
                .query(
                    q.Update(q.Ref(q.Collection('carts'), id), { data: cart }),
                    {
                        queryTimeout: 30000,
                    }
                )
                .then((response) => {
                    console.log('success', response);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(response),
                    };
                });
        })
        .catch((error) => {
            console.log('error', error);
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
        });
};
