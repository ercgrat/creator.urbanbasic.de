const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNA_DB_SECRET,
});

exports.handler = async (event, context) => {
    console.log(context);
    return client
        .query(q.Paginate(q.Match(q.Index('all_orders'))), {
            ts: Date.now()*1000 // Microseconds since epoch
        })
        .then(response => {
            const itemRefs = response.data;
            // create new query out of item refs. http://bit.ly/2LG3MLg
            const getAllItemsDataQuery = itemRefs.map(([ts, ref]) => {
                return q.Get(ref);
            });
            // then query the refs
            return client.query(getAllItemsDataQuery).then(ret => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(ret),
                };
            });
        })
        .catch(error => {
            console.log('error', error);
            return {
                statusCode: 400,
                body: JSON.stringify(error),
            };
        });
};