import { Module, ModuleTitle } from "@/modules/_module";
import { LoadStorage } from "@/util/storage";
import { DataSyncModule } from "@/modules/dataSync";
import { SettingsModule } from "@/modules/settings";
import { ActivitiesModule } from "@/modules/activities";
import { SettingsOtherModule } from "@/modules/settingsOthers";
import { ExampleModule } from "@/modules/example";

let modulesRegistered = false;

// Order here affects order displayed in the settings
export const modulesToRegister: Module[] =
[
    new DataSyncModule(),
    new SettingsModule(),
    new ActivitiesModule(),
    new SettingsOtherModule(),
    new ExampleModule()
];

// DO NOT POPULATE! Modules from modulesToRegister will be added at runtime
export const registeredModules: Partial<Record<ModuleTitle, Module>> =
{

}

export const settings: Partial<BCBCSASettings> = {};
export async function RegisterModules(): Promise<void>
{
    // No duplicate module registering
    if (modulesRegistered) { return; }

    modulesToRegister.forEach((module) =>
    {
        registeredModules[module.Title] = module;

        // Get all the settings
        const modSet = module.Settings;
        const newSettings = {};
        modSet.forEach((set) =>
        {
            newSettings[set.name] = set;
        });
        if (Object.keys(newSettings).length !== 0)
        {
            settings[module.Title] = newSettings;
        }
    });
    await LoadStorage();

    // Load the modules
    modulesToRegister.forEach((module) =>
    {
        module.Load();
    });
    modulesRegistered = true;
}
