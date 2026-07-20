import { Module, ModuleTitle } from "@/modules/_module";
import { FindCharacterInRoom, GetAttributeFromChatDictionary } from "@/util/messaging";
import { activityImages, activityPrerequisites, activityReceived, activityTriggers } from "@/util/activities";
import { HookFunction } from "@/util/sdk";
import { ACTIVITY_NAME_PREFIX, ICONS } from "@/util/constants";

const ADDON_TOOLTIP = document.createElement("img");
ADDON_TOOLTIP.src = ICONS.PAW;
ADDON_TOOLTIP.style.position = "absolute";
ADDON_TOOLTIP.style.right = "1%";
ADDON_TOOLTIP.style.bottom = "23%";
ADDON_TOOLTIP.style.width = "1.4em";
ADDON_TOOLTIP.style.height = "1.4em";

export class ActivitiesModule extends Module
{
    get Title(): ModuleTitle
    {
        return ModuleTitle.Activities;
    }

    Load(): void
    {
        super.Load();

        // Prerequisite handling
        HookFunction(this.Title, "ActivityCheckPrerequisite", 1, (args, next) =>
        {
            const [prereq, acting, acted, group] = args;
            if (Object.keys(activityPrerequisites).includes(prereq))
            {
                return activityPrerequisites[prereq](acting, acted, group);
            }
            return next(args);
        });

        // Activity ontriggers
        HookFunction(this.Title, "ServerSend", 1, (args, next) =>
        {
            const data = args[1] as ServerChatRoomMessage;
            if (args[0] !== "ChatRoomChat" || data?.Type !== "Activity")
            {
                return next(args);
            }
            // @ts-ignore - TS not finding type automatically, it exists
            const activityName = data?.Dictionary?.find((x) => x.ActivityName)?.ActivityName as string | undefined;
            if (activityName?.startsWith(ACTIVITY_NAME_PREFIX))
            {
                data?.Dictionary?.push({
                    Tag: `${TEXT_NOT_FOUND_PREFIX} "ActivityDictionary.csv": ${data.Content}`,
                    Text: ActivityDictionaryText(data.Content)
                });

                if (Object.keys(activityTriggers).includes(activityName))
                {
                    const targetNumber = (data?.Dictionary?.find((x) => (x as TargetCharacterDictionaryEntry).TargetCharacter) as TargetCharacterDictionaryEntry)?.TargetCharacter ?? -1;
                    const target = ChatRoomCharacter?.find((c) => c.MemberNumber === targetNumber);
                    activityTriggers[activityName](target);
                }
            }

            return next(args);
        });

        // Activity on received
        HookFunction(this.Title, "ChatRoomMessage", 0, (args, next) =>
        {
            next(args);
            const data = args[0];
            if (
                data.Type === "Activity"
            )
            {
                const activityName = GetAttributeFromChatDictionary(data, "ActivityName") as string | undefined;
                if (!activityName?.startsWith(ACTIVITY_NAME_PREFIX)
                  || !(activityName in activityReceived))
                {
                    return;
                }
                const sourceChar = FindCharacterInRoom(GetAttributeFromChatDictionary(data, "SourceCharacter"),
                    { MemberNumber: true, Nickname: false, Name: false }) ?? undefined;
                const targetChar = FindCharacterInRoom(GetAttributeFromChatDictionary(data, "TargetCharacter"),
                    { MemberNumber: true, Nickname: false, Name: false }) ?? undefined;
                const group = GetAttributeFromChatDictionary(data, "FocusGroupName");
                activityReceived[activityName](sourceChar, targetChar, group, data);
            }
        });

        // Draw custom images for activities
        HookFunction(this.Title, "ElementButton.CreateForActivity", 0, (args, next) =>
        {
            const activityName = args[1].Activity.Name;
            const isBCBCSAActivity = Object.keys(activityImages).includes(activityName);
            if (isBCBCSAActivity)
            {
                if (!args[4])
                {
                    args[4] = {};
                }
                args[4].image = activityImages[activityName];
            }

            const buttonElement = next(args);

            if (isBCBCSAActivity)
            {
                buttonElement.appendChild(ADDON_TOOLTIP.cloneNode());
            }

            return buttonElement;
        });
    }

    Unload(): void
    {
        super.Unload();
    }
}
