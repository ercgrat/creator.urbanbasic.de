export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export interface IFaunaObject<T> {
    ref: {
        '@ref': {
            id: 'string';
        };
    };
    data: T;
    ts: number;
}
