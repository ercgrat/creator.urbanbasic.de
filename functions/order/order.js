exports.handler = async (event, context) => {
    const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
    const segments = path.split('/').filter((e) => e);

    switch (event.httpMethod) {
        case 'GET':
            // e.g. GET /.netlify/functions/fauna-crud
            if (segments.length === 0) {
                return require('./read-all').handler(event, context);
            }
            return {
                statusCode: 400,
                body:
                    'Incorrect number of segments in GET request, must be /.netlify/functions/order/123456',
            };
        case 'POST':
            // e.g. POST /.netlify/functions/fauna-crud with a body of key value pair objects, NOT strings
            return require('./create').handler(event, context);
        case 'PATCH':
            // e.g. PATCH /.netlify/functions/fauna-crud/123456 with a body of key value pair objects, NOT strings
            if (segments.length === 1) {
                event.id = segments[0];
                return require('./update').handler(event, context);
            } else {
                return {
                    statusCode: 400,
                    body:
                        'Incorrect number of segments in PATCH request, must be /.netlify/functions/order/123456',
                };
            }
    }
    return {
        statusCode: 400,
        body: 'unrecognized HTTP Method, must be one of GET/POST',
    };
};
