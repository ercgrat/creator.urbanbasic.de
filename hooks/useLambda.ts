import { useCallback, useState } from "react";

function lambda(func: string, method: ('POST' | 'GET' | 'PUT'), body?: object, token?: string): Promise<Response> {
    return fetch(`/.netlify/functions/${func}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: token ? [
            ['Authorization', `Bearer ${token}`]
        ] : []
    });
};

export interface IFaunaObject<T> {
    ref: {
        '@ref': {
            id: 'string'
        }
    },
    data: T,
    ts: number
}

type LambdaExecutor<T> = (
    path: string,
    method: 'GET' | 'POST' | 'PUT',
    body?: object,
    token?: string,
    onSuccess?: () => void,
    onError?: () => void
) => Promise<T>;

export default function useLambda<ResponseType>(): { data: ResponseType, execute: LambdaExecutor<ResponseType>, isLoading: boolean, hasExecuted: boolean } {

    const [data, setData] = useState<ResponseType>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasExecuted, setHasExecuted] = useState<boolean>(false);

    const execute = useCallback((
        path: string,
        method: 'GET' | 'POST' | 'PUT',
        body?: object,
        token?: string,
        onSuccess?: () => void,
        onError?: () => void
    ): Promise<ResponseType> => {
        setIsLoading(true);
        return lambda(path, method, body, token).then(async response => {
            if (response.ok) {
                const result = await response.json();
                setData(result);
                onSuccess && onSuccess();
                return result;
            } else {
                onError && onError();
                console.log(response);
                return null;
            }
        }).catch(err => {
            onError && onError();
            console.log(err);
        }).finally(() => {
            setHasExecuted(true);
            setIsLoading(false);
        });
    }, [setData, setIsLoading]);

    return { data, execute, isLoading, hasExecuted };
}