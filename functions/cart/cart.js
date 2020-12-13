exports.handler = async (event, context) => {
    const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
    const segments = path.split('/').filter((e) => e);

    switch (event.httpMethod) {
        case 'GET':
            // e.g. GET /.netlify/functions/fauna-crud
            if (segments.length === 0) {
                return {
                    statusCode: 400,
                    body:
                        'Too few segments in GET request, must be /.netlify/functions/cart/123456',
                };
            }
            // e.g. GET /.netlify/functions/fauna-crud/123456
            if (segments.length === 1) {
                event.id = segments[0];
                return require('./read').handler(event, context);
            } else {
                return {
                    statusCode: 400,
                    body:
                        'Too many segments in GET request, must be /.netlify/functions/carts/123456',
                };
            }
        case 'POST':
            // e.g. POST /.netlify/functions/fauna-crud with a body of key value pair objects, NOT strings
            return require('./create').handler(event, context);
        case 'PUT':
            // e.g. PUT /.netlify/functions/fauna-crud/123456 with a body of key value pair objects, NOT strings
            if (segments.length === 1) {
                event.id = segments[0];
                return require('./update').handler(event, context);
            } else {
                return {
                    statusCode: 400,
                    body:
                        'Incorrect number of segments in PUT request, must be /.netlify/functions/cart/123456',
                };
            }
        case 'DELETE':
            // e.g. DELETE /.netlify/functions/fauna-crud/123456/item/123456 with a body of key value pair objects, NOT strings
            if (segments.length === 3) {
                event.id = segments[0];
                event.itemId = segments[2];
                return require('./delete').handler(event, context);
            } else {
                return {
                    statusCode: 400,
                    body:
                        'Incorrect number of segments in DELETE request, must be /.netlify/functions/cart/123456/item/123456',
                };
            }
    }
    return {
        statusCode: 400,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT',
    };
};
