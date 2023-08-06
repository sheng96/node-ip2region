/// <reference types="node" />
declare const getStartEndPtr: unique symbol;
declare const getBuffer: unique symbol;
declare const openFilePromise: unique symbol;
declare class Searcher {
    private _dbFile;
    private _vectorIndex;
    private _buffer;
    constructor(dbFile: string, vectorIndex: any, buffer: any);
    [getStartEndPtr](idx: number, fd: any, ioStatus: any): Promise<{
        sPtr: any;
        ePtr: any;
    }>;
    [getBuffer](offset: number, length: number, fd: any, ioStatus: any): Promise<any>;
    [openFilePromise](fileName: string): Promise<unknown>;
    search(ip: string): Promise<{
        region: any;
        ioCount: number;
        took: number;
    }>;
}
declare const isValidIp: (ip: string) => boolean;
declare const newWithFileOnly: (dbPath?: string) => Searcher;
declare const newWithVectorIndex: (dbPath: string, vectorIndex: number) => Searcher;
declare const newWithBuffer: (buffer: any) => Searcher;
declare const loadVectorIndexFromFile: (dbPath: string) => Buffer;
declare const loadContentFromFile: (dbPath: string) => Buffer;
export { isValidIp, loadVectorIndexFromFile, loadContentFromFile, newWithFileOnly, newWithVectorIndex, newWithBuffer };
