import { RemoveHooks } from "@/util/sdk";
import { CreateActivities, RemoveActivities } from "@/util/activities";
import { AddDataSyncListeners, HookedMessage, RemoveDataSyncListeners } from "@/util/messaging";
import { registeredModules } from "@/util/registerModules";

export enum ModuleTitle
{
    Unknown = "Unknown",
    Example = "Example",
    Activities = "Activities",
    Settings = "Settings",
    DataSync = "DataSync",
    SettingsOther = "SettingsOther"
}

/**
 * Check if a module is public, allowing the data to be shared with others
 *
 * @param moduleTitle The module to check
 * @returns
 */
export function ModuleIsPublic(moduleTitle: ModuleTitle): boolean
{
    return registeredModules[moduleTitle]?.Public ?? true;
}

export abstract class Module
{
    /**
     * Title for this module, it must be unique and the only module sharing this title
     */
    get Title(): ModuleTitle
    {
        return ModuleTitle.Unknown;
    }

    /**
     * Any activities this module will create
     */
    get Activities(): CustomActivity[]
    {
        return [];
    }

    /**
     * Settings / data to be stored for this module
     */
    get Settings(): Setting[]
    {
        return [];
    }

    /**
     * Listen for BCBCSA private messages and do something with them
     */
    get SyncListeners(): HookedMessage[]
    {
        return [];
    }

    /**
     * If the data stored in this module will be shared with others
     */
    get Public(): boolean
    {
        return false;
    }

    /**
     * 
     */
    get DisplayInSettings(): boolean
    {
        return false;
    }

    Load(): void
    {
        CreateActivities(this.Activities);
        AddDataSyncListeners(this.SyncListeners);
    }

    Unload(): void
    {
        RemoveHooks(this.Title);
        RemoveActivities(this.Activities);
        RemoveDataSyncListeners(this.Title);
    }

    Reload(): void
    {
        this.Unload();
        this.Load();
    }
}
