interface Requires {
    (name: string): any;
}
interface CreateRequires {
    (dependencies?: object): Requires;
}
export declare const createRequires: CreateRequires;
export {};
