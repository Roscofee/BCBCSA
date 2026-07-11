import { HookedMessage, SenBCBCSAMessage } from "@/util/messaging";
import { LocalizedText } from "@/localization/localization";
import { ADDON_NAME, ICONS, STORAGE_KEY } from "@/util/constants";
import { bcxFound, HookFunction } from "@/util/sdk";
import { Module, ModuleTitle } from "@/modules/_module";
import { currentMenu, ExitButtonPressed, PreferenceMenuClick, PreferenceMenuRun, SetSettingChar } from "@/modules/settings";

// Other settings
const BCBCSA_REMOTE = [1700, 650, 90, 90] as const;
// BCX moves the button down by 35 for some reason
const BCBCSA_REMOTE_BCX = [1700, BCBCSA_REMOTE[1] + 35, 90, 90] as const;
// Positioning for version text
const VERSION_TEXT_SELF = [
    275,
    900,
    350
] as const;
const VERSION_TEXT_OTHER = [
    VERSION_TEXT_SELF[0],
    VERSION_TEXT_SELF[1] - 50,
    VERSION_TEXT_SELF[2]
] as const;

function ArraysEqual(arr1: any[], arr2: any[]): boolean
{
    if (arr1.length !== arr2.length)
    {
        return false;
    };
    return arr1.every((value, index) => value === arr2[index]);
}

export function ObjectDifferences(oldObj: object, newObj: object): object
{
    const differences = {};

    for (const key in oldObj)
    {
        // Key is missing in newObj
        if (!(key in newObj))
        {
            differences[key] = { old: oldObj[key], new: undefined };
            continue;
        }

        const oldValue = oldObj[key];
        const newValue = newObj[key];

        if (
            Array.isArray(oldValue)
            && Array.isArray(newValue)
        )
        {
            // If both are arrays, compare their contents
            if (!ArraysEqual(oldValue, newValue))
            {
                differences[key] = { old: oldValue, new: newValue };
            }
        }
        else if (
            typeof oldValue === "object"
            && typeof newValue === "object"
            && !Array.isArray(oldValue))
        {
            // If both are objects, recursively check for differences
            const diff = ObjectDifferences(oldValue, newValue);
            if (Object.keys(diff).length > 0)
            {
                differences[key] = diff;
            }
        }
        else if (oldValue !== newValue)
        {
            // If values are different, store the difference
            differences[key] = { old: oldValue, new: newValue };
        }
    }

    // New keys not found in the old object
    for (const key in newObj)
    {
        if (!(key in oldObj))
        {
            differences[key] = { old: undefined, new: newObj[key] };
        }
    }

    return differences;
}

export class SettingsOtherModule extends Module
{
    get Title(): ModuleTitle
    {
        return ModuleTitle.SettingsOther;
    }

    get SyncListeners(): HookedMessage[]
    {
        return [
            // Probably not needed and can be cut
            // {
            //     module: this.Title,
            //     message: "SettingPutRequest",
            //     action: function (sender: Character, content: MPAMessageContent): void
            //     {

            //     }
            // }, {
            //     module: this.Title,
            //     message: "EditingSettings",
            //     action: function (sender: Character, _content: MPAMessageContent): void
            //     {
            //         // if (Player[STORAGE_KEY][ModuleTitle.Authority].settingsNotify)
            //         // {
            //         //     NotifyPlayer(LocalizedText("SourceCharacter is accessing your MPA settings.").replace("SourceCharacter", sender.Nickname || sender.Name), 30000);
            //         // }
            //     }
            // }
        ];
    }

    Load(): void
    {
        super.Load();

        // Prio has to be 1 more than LSCG or BCX hooks
        const hookPriority = 12;
        HookFunction(this.Title, "InformationSheetRun", hookPriority, (args, next) =>
        {
            // LSCG or BCX subscreens open instead
            if (window.bcx?.inBcxSubscreen() || window.LSCG_REMOTE_WINDOW_OPEN)
            {
                return next(args);
            }

            // BCBCSA Settings are open
            if (window[ADDON_NAME].menuLoaded)
            {
                const char = InformationSheetSelection;
                if (char?.[STORAGE_KEY] && !char.IsPlayer() && currentMenu == null)
                {
                    DrawTextFit(
                        `${LocalizedText("Your Version")}: ${Player[STORAGE_KEY].version}`,
                        ...VERSION_TEXT_SELF,
                        "Black",
                        "Gray"
                    );
                    DrawTextFit(
                        `${LocalizedText("TargetCharacter's Version")}: ${char?.[STORAGE_KEY].version}`.replace("TargetCharacter", char?.Nickname || char?.Name),
                        ...VERSION_TEXT_OTHER,
                        "Black",
                        "Gray"
                    );
                }
                PreferenceMenuRun();
                return;
            }

            next(args);
            // Draw the remote into settings button if applicable
            const char = InformationSheetSelection;
            if (char?.[STORAGE_KEY] && !char.IsPlayer())
            {
                const access = ServerChatRoomGetAllowItem(Player, char);
                DrawButton(
                    ...((bcxFound() ? BCBCSA_REMOTE_BCX : BCBCSA_REMOTE) as readonly [number, number, number, number]),
                    "",
                    access ? "#ffffff" : "#aaaaaa",
                    ICONS.PAW,
                    LocalizedText(access ? `${ADDON_NAME}` : `${ADDON_NAME}: No BC item permission`),
                    false
                );
            }
        });

        HookFunction(this.Title, "InformationSheetClick", hookPriority, (args, next) =>
        {
            // LSCG or BCX subscreens open instead
            if (window.bcx?.inBcxSubscreen() || window.LSCG_REMOTE_WINDOW_OPEN)
            {
                return next(args);
            }

            if (window[ADDON_NAME].menuLoaded)
            {
                return PreferenceMenuClick();
            }

            const char = InformationSheetSelection;
            if (
                MouseIn(...((bcxFound() ? BCBCSA_REMOTE_BCX : BCBCSA_REMOTE) as readonly [number, number, number, number]))
                && char?.[STORAGE_KEY]
                && !char.IsPlayer()
                && ServerChatRoomGetAllowItem(Player, char)
            )
            {
                window[ADDON_NAME].menuLoaded = true;
                // BCBCSA is defined from check above, so other character is same as self in structure
                SetSettingChar(char as PlayerCharacter);
                SenBCBCSAMessage({ message: "EditingSettings" }, char.MemberNumber);
            }
            else
            {
                return next(args);
            }
        });

        HookFunction(this.Title, "InformationSheetExit", hookPriority, (args, next) =>
        {
            if (window[ADDON_NAME].menuLoaded)
            {
                ExitButtonPressed();
                return;
            }
            return next(args);
        });
    }

    Unload(): void
    {
        super.Unload();
    }
}
