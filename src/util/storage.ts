import { settings as currentSettings } from "@/util/registerModules";
import { AwaitPlayer } from "@/util/sdk";
import { SettingSync } from "@/modules/dataSync";
import { ModuleTitle } from "@/modules/_module";
import { STORAGE_KEY, ADDON_VERSION, ADDON_NAME } from "@/util/constants";
import { LoadLocalStorage, ResetLocalStorage } from "@/util/localStorage";

export async function LoadStorage(): Promise<void>
{
    // Ensure the player is loaded before attempting to read the extension settings
    await AwaitPlayer();
    LoadLocalStorage();

    const settings: BCBCSARecords = (JSON.parse(LZString.decompressFromBase64(Player.ExtensionSettings?.[STORAGE_KEY] ?? "") ?? "{}") ?? {}) as BCBCSARecords;

    Object.entries(currentSettings).forEach((category) =>
    {
        const [settingTitle, categorySettings] = category as [ModuleTitle, BCBCSACategorySettings];
        for (const [settingName, set] of Object.entries(categorySettings))
        {
            // Create the place for data if it does not exist
            if (!(settingTitle in settings))
            {
                settings[settingTitle] = {};
            }
            // Setting already set
            // Verify it is good data
            if (settingName in settings[settingTitle])
            {
                // If current value is not in the options
                if (
                    (currentSettings?.[settingTitle]?.[settingName]?.type === "checkbox"
                      && typeof settings[settingTitle][settingName] !== "boolean")
                    || (currentSettings?.[settingTitle]?.[settingName]?.type === "number"
                      && isNaN(settings[settingTitle][settingName]))
                    || ("options" in (currentSettings?.[settingTitle]?.[settingName] ?? {})
                      && !((currentSettings?.[settingTitle]?.[settingName] as OptionSetting)?.options ?? []).includes(settings[settingTitle][settingName]))
                )
                {
                    settings[settingTitle][settingName] = set.value;
                    console.warn(`${ADDON_NAME}: Invalid setting of "${settings[settingTitle][settingName]}" at ${settingTitle}->${settingName}, resetting to default`);
                }
                continue;
            }
            settings[settingTitle][settingName] = set.value;
        }
    });

    if (settings.version !== ADDON_VERSION)
    {
        settings.version = ADDON_VERSION;
    }

    Player[STORAGE_KEY] = settings;
    return;
}

export function SaveStorage(syncWithOthers: boolean = true): void
{
    if (!Player[STORAGE_KEY] || !Player.ExtensionSettings)
    {
        return;
    }
    Player.ExtensionSettings[STORAGE_KEY] = LZString.compressToBase64(JSON.stringify(Player[STORAGE_KEY]));
    ServerPlayerExtensionSettingsSync(STORAGE_KEY);
    if (syncWithOthers)
    {
        SettingSync(false);
    }
}

export async function ResetStorage(): Promise<void>
{
    delete (Player.ExtensionSettings as any)[STORAGE_KEY];
    Player.ExtensionSettings[STORAGE_KEY] = LZString.compressToBase64(JSON.stringify({ version: ADDON_VERSION }));
    await LoadStorage();
    ResetLocalStorage();
    SaveStorage();
    return;
}

export async function ExportSettingsToClipboard(): Promise<void>
{
    return navigator.clipboard.writeText(LZString.compressToBase64(JSON.stringify(Player[STORAGE_KEY])));
}

export async function ImportSettingsFromClipboard(): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        navigator.clipboard.readText().then((text) =>
        {
            try
            {
                const newSettings: BCBCSARecords = JSON.parse(LZString.decompressFromBase64(text ?? "") ?? "{}") as BCBCSARecords;
                // Create a locally copy to modify in case it fails and need to revert
                // Transaction happens or not at all
                const currentSettings: BCBCSARecords = JSON.parse(JSON.stringify(Player[STORAGE_KEY])) as BCBCSARecords;

                for (const key in newSettings)
                {
                    if (newSettings[key] !== undefined)
                    {
                        // Only update the value if the newRecord key exists and is not undefined
                        currentSettings[key as keyof BCBCSARecords] = newSettings[key];
                    }
                }

                // Verify new settings are good
                // If bad data  return reject();

                Player[STORAGE_KEY] = currentSettings;

                SaveStorage(true);
            }
            catch (error)
            {
                console.warn(error);
                return reject();
            }

            return resolve();
        }, () => reject());
    });
}
