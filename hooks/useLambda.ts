import { useCallback, useState } from 'react';
import { HttpMethod } from '../model/lambda';
import { lambda } from '../utils/lambda';

type LambdaExecutor<ResponseType, RequestType> = (
    path: string,
    method: HttpMethod,
    body?: RequestType,
    token?: string,
    onSuccess?: () => void,
    onError?: () => void
) => Promise<ResponseType>;

export default function useLambda<ResponseType, RequestType>(): {
    data?: ResponseType;
    execute: LambdaExecutor<ResponseType, RequestType>;
    isLoading: boolean;
    hasExecuted: boolean;
} {
    const [data, setData] = useState<ResponseType>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasExecuted, setHasExecuted] = useState<boolean>(false);

    const execute = useCallback(
        (
            path: string,
            method: HttpMethod,
            body?: RequestType,
            token?: string,
            onSuccess?: () => void,
            onError?: () => void
        ): Promise<ResponseType> => {
            setIsLoading(true);
            return lambda<RequestType>(path, method, body, token)
                .then(async (response) => {
                    if (response.ok) {
                        const result = await response.json();
                        setData(result);
                        onSuccess && onSuccess();
                        return result;
                    } else {
                        console.log(response);
                        throw new Error(response.statusText);
                    }
                })
                .catch((err) => {
                    onError && onError();
                    throw err;
                })
                .finally(() => {
                    setHasExecuted(true);
                    setIsLoading(false);
                });
        },
        [setData, setIsLoading]
    );

    return { data, execute, isLoading, hasExecuted };
}
