import { ADDON_NAME } from "@/util/constants";

const KEY = `${ADDON_NAME}_STORAGE`;

let storage: BCBCSALocalStorage;

function BlankStorage(): BCBCSALocalStorage
{
    return {
        lastOnline: Date.now()
    };
}

export function GetLocalStorage(): BCBCSALocalStorage
{
    return storage;
}

export function LoadLocalStorage(): void
{
    storage = (JSON.parse(LZString.decompressFromBase64(window.localStorage.getItem(KEY) ?? "") ?? "{}") ?? BlankStorage()) as BCBCSALocalStorage;
}

export function ResetLocalStorage(): void
{
    storage = BlankStorage();
    SaveToLocalStorage();
}

export function SaveToLocalStorage(): void
{
    // Check if existing local storage
    window.localStorage.setItem(KEY, LZString.compressToBase64(JSON.stringify(storage)));
}
