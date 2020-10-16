import { useCallback, useState } from "react";
import netlifyIdentity from 'netlify-identity-widget';

function lambda(func: string, method: ('POST' | 'GET'), body?: object, token?: netlifyIdentity.Token): Promise<Response> {
    return fetch(`/.netlify/functions/${func}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: token ? [
            ['Authorization', `Bearer ${token.access_token}`]
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

type LambdaExecutor = (
    path: string,
    method: 'GET' | 'POST',
    body?: object,
    token?: netlifyIdentity.Token,
    onSuccess?: () => void,
    onError?: () => void
) => void;

export default function useLambda<T>(): { data: T, execute: LambdaExecutor, isLoading: boolean } {

    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback((
        path: string,
        method: 'GET' | 'POST',
        body?: object,
        token?: netlifyIdentity.Token,
        onSuccess?: () => void,
        onError?: () => void
    ) => {
        setIsLoading(true);
        lambda(path, method, body, token).then(async response => {
            if (response.ok) {
                const result = await response.json();
                setData(result);
                onSuccess();
            } else {
                onError();
                console.log(response);
            }
        }).catch(err => {
            onError();
            console.log(err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [setData, setIsLoading]);

    return { data, execute, isLoading };
}