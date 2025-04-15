declare module 'msw' {
  export interface RestRequest<T = any, P = any> {
    body: T;
    params: P;
  }
  
  export interface RestContext {
    status: (statusCode: number) => any;
    json: (body: any) => any;
    delay: (ms: number) => any;
    text: (text: string) => any;
  }
  
  export interface ResponseComposition<T = any> {
    (resolver: any): Response;
    json: (body: T) => Response;
    text: (text: string) => Response;
  }
  
  export interface PathParams {
    [key: string]: string;
  }
  
  export interface DefaultBodyType {
    [key: string]: any;
  }
  
  export interface RestHandler {
    (req: RestRequest, res: ResponseComposition, ctx: RestContext): any;
  }
  
  export const rest: {
    get: (path: string, handler: RestHandler) => any;
    post: (path: string, handler: RestHandler) => any;
    put: (path: string, handler: RestHandler) => any;
    delete: (path: string, handler: RestHandler) => any;
    patch: (path: string, handler: RestHandler) => any;
  };
}

declare module 'msw/node' {
  export function setupServer(...handlers: any[]): {
    listen: (options?: any) => void;
    close: () => void;
    resetHandlers: (...handlers: any[]) => void;
    use: (...handlers: any[]) => void;
  };
}
