import { HttpMethod } from '../model/lambda';

export const lambda = <RequestType>(
    func: string,
    method: HttpMethod,
    body?: RequestType,
    token?: string
): Promise<Response> => {
    return fetch(`/.netlify/functions/${func}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: token ? [['Authorization', `Bearer ${token}`]] : [],
    });
};

export const processLambda = <RequestType, ResponseType>(
    func: string,
    method: HttpMethod,
    body?: RequestType,
    token?: string
): Promise<ResponseType> => {
    return lambda(func, method, body, token)
        .then(async (response) => {
            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                console.log(response);
                throw new Error(response.statusText);
            }
        })
        .catch((err) => {
            throw err;
        });
};
