declare module "*.mp3" {
    const src: string;
    export default src;
}

declare var require: {
    context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
    ): {
    keys(): string[];
    (id: string): any;
    };
};