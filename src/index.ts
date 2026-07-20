import { RegisterModules } from "./util/registerModules";
import { BuildAllCommands } from "./commands/buildAllCommands";
import { ADDON_NAME, ADDON_VERSION } from "./util/constants";

console.log(`Loading ${ADDON_NAME}`);

const api: AddonWindowApi = {
    version: ADDON_VERSION,
    menuLoaded: false
};
window[ADDON_NAME] = api;

BuildAllCommands();
RegisterModules();
