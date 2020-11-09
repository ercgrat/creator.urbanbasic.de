import { useCallback, useState } from "react";

function lambda<RequestType>(
  func: string,
  method: "POST" | "GET" | "PUT" | "PATCH",
  body?: RequestType,
  token?: string
): Promise<Response> {
  return fetch(`/.netlify/functions/${func}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: token ? [["Authorization", `Bearer ${token}`]] : [],
  });
}

export interface IFaunaObject<T> {
  ref: {
    "@ref": {
      id: "string";
    };
  };
  data: T;
  ts: number;
}

type LambdaExecutor<ResponseType, RequestType> = (
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  body?: RequestType,
  token?: string,
  onSuccess?: () => void,
  onError?: () => void
) => Promise<ResponseType | void>;

export default function useLambda<
  ResponseType extends object = null,
  RequestType extends object = null
>(): {
  data: ResponseType;
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
      method: "GET" | "POST" | "PUT" | "PATCH",
      body?: RequestType,
      token?: string,
      onSuccess?: () => void,
      onError?: () => void
    ): Promise<ResponseType | void> => {
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
