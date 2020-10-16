exports.handler = async (event, context) => {
    const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
    const segments = path.split('/').filter(e => e);

    switch (event.httpMethod) {
        case 'GET':
            // e.g. GET /.netlify/functions/fauna-crud
            if (segments.length === 0) {
                return {
                    statusCode: 400,
                    body: 'Request must include at least one identifier'
                };
            }
            event.id = segments[0];
            return require('./read').handler(event, context);
    }

    return {
        statusCode: 400,
        body: 'unrecognized HTTP Method, must be GET',
    };
}
