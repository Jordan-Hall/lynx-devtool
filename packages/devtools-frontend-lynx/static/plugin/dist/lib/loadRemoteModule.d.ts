interface LoadRemoteModule {
    (url: string): Promise<any>;
}
interface CreateLoadRemoteModule {
    (CreateLoadRemoteModuleOptions?: any): LoadRemoteModule;
}
export declare const createLoadRemoteModule: CreateLoadRemoteModule;
export {};
