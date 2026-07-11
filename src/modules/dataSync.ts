// Never send Private BCBCSA data across the server and never accept Private BCBCSA data
import { HookFunction } from "@/util/sdk";
import { Module, ModuleIsPublic, ModuleTitle } from "@/modules/_module";
import { FindCharacterInRoom, GeBCBCSAMessageFromChat, HookedMessage, hookedMessages, BCBCSAMessageContent, SenBCBCSAMessage } from "@/util/messaging";
import { STORAGE_KEY } from "@/util/constants";

/**
 * Sync all of your current settings with everyone else
 * @param reply - If we want others to share their settings back
 * @param target - Share only to this one MemberNumber
 */
export function SettingSync(reply: boolean = false, target?: number): void
{
    const settings = structuredClone(Player[STORAGE_KEY]) as BCBCSASettings;
    console.log("settings pre", settings);
    Object.keys(settings).forEach((moduleTitle) =>
    {
        if (!ModuleIsPublic(moduleTitle as ModuleTitle))
        {
            delete settings[moduleTitle];
        }
    });

    SenBCBCSAMessage({
        message: "SettingSync",
        settings: settings,
        reply: reply
    }, target);
    console.log("settings pros", settings);
}

/**
 * Sync all of your current settings of a given category with others
 * @param category - Which ModuleTitle category to share
 * @param target - Share only to this one MemberNumber
 */
export function CategorySync(category: ModuleTitle, target?: number): void
{
    if (!ModuleIsPublic(category))
    {
        return;
    }
    SenBCBCSAMessage({
        message: "CategorySync",
        category: category,
        value: Player[STORAGE_KEY][category]
    }, target);
}

/**
 * Sync only a single record from a given category with others
 * @param category - Which ModuleTitle category to share
 * @param record - Record within ModuleTitle you want to share
 * @param target - Share only to this one MemberNumber
 */
export function RecordSync(category: ModuleTitle, record: string, target?: number): void
{
    RecordsSync([{ category: category, record: record }], target);
}

type TransmitRecords = { category: ModuleTitle; record: string; value?: any }[];
/**
 * Sync multiple records from any given category with others
 * @param records.category - Which ModuleTitle category to share
 * @param records.record - Record within ModuleTitle you want to share
 * @param target - Share only to this one MemberNumber
 */
export function RecordsSync(records: TransmitRecords, target?: number): void
{
    for (let i = records.length - 1; i >= 0; i--)
    {
        const record = records[i];
        if (!ModuleIsPublic(record.category))
        {
            records.splice(i, 1);
            continue;
        }
        record.value = Player[STORAGE_KEY][record.category][record.record];
    }
    if (records.length === 0)
    {
        return;
    }
    SenBCBCSAMessage({
        message: "RecordsSync",
        records: records
    }, target);
}

export class DataSyncModule extends Module
{
    get Title(): ModuleTitle
    {
        return ModuleTitle.DataSync;
    }

    get SyncListeners(): HookedMessage[]
    {
        return [
            {
                module: ModuleTitle.DataSync,
                message: "SettingSync",
                action: function (sender: Character, content: BCBCSAMessageContent): void
                {
                    console.log("SettingSync", content);
                    if (sender.MemberNumber === Player.MemberNumber)
                    {
                        return;
                    }
                    sender[STORAGE_KEY] = content.settings;
                    if (content.reply)
                    {
                        SettingSync(false, sender.MemberNumber);
                    }
                }
            }, {
                module: ModuleTitle.DataSync,
                message: "CategorySync",
                action: function (sender: Character, content: BCBCSAMessageContent): void
                {
                    console.log("CategorySync", content);
                    if (sender.MemberNumber === Player.MemberNumber)
                    {
                        return;
                    }
                    if (!sender[STORAGE_KEY])
                    {
                        SettingSync(false, sender.MemberNumber);
                    }
                    else
                    {
                        sender[STORAGE_KEY][content.category] = content.value;
                    }
                }
            }, {
                module: ModuleTitle.DataSync,
                message: "RecordsSync",
                action: function (sender: Character, content: BCBCSAMessageContent): void
                {
                    console.log("RecordsSync", content);
                    if (sender.MemberNumber === Player.MemberNumber)
                    {
                        return;
                    }
                    for (const record of content.records as TransmitRecords)
                    {
                        if (!sender?.[STORAGE_KEY]?.[record.category])
                        {
                            CategorySync(content.category, sender.MemberNumber);
                        }
                        else
                        {
                            sender[STORAGE_KEY][record.category][record.record] = record.value;
                        }
                    }
                }
            }
        ];
    }

    Load(): void
    {
        super.Load();

        // BCBCSA loaded in a chatroom, Sync with others in the room
        if (ChatRoomCharacter.length !== 0)
        {
            SettingSync(true);
        }

        // When joining a room, sync MPA settings with everyone else
        HookFunction(ModuleTitle.DataSync, "ChatRoomSync", 0, (args, next) =>
        {
            const ret = next(args);
            SettingSync(true);
            return ret;
        });

        // Sync request, handle and reply if needed
        HookFunction(ModuleTitle.DataSync, "ChatRoomMessage", 0, (args, next) =>
        {
            const data = args[0];
            const content = GeBCBCSAMessageFromChat(data);
            if (!content)
            {
                return next(args);
            }
            const sender = FindCharacterInRoom(data.Sender ?? "", { MemberNumber: true, Name: false, Nickname: false });
            if (!sender)
            {
                return next(args);
            }

            // Handle the data listeners
            hookedMessages.forEach((hook) =>
            {
                if (content.message === hook.message)
                {
                    hook.action(sender, content);
                }
            });
        });
    }

    Unload(): void
    {
        super.Unload();
    }
}
