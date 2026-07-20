// globals.d.ts

import { ModuleTitle } from "../src/util/settingTypes";
import { type BCBCSAMessageContent } from "../src/util/messaging";
import { ADDON_NAME_TYPE } from "@/util/constants";

declare global
{
    interface AddonWindowApi
    {
        version: string;
        menuLoaded: boolean;
    }

    // Settings of BCBCSA
    interface Setting
    {
        name: string;
        type: "checkbox" | "option" | "text" | "number" | "record" | "custom";
        value: any;
    }
    interface DisplayedSetting extends Setting
    {
        active: (C: Character) => boolean;
        label: string;
        doNotModify?: (C: Character) => boolean;
    }
    interface CheckboxSetting extends DisplayedSetting
    {
        type: "checkbox";
        value: boolean;
        onSet?: (C: Character, value: boolean, prevValue: boolean) => void;
    }
    interface OptionSetting extends DisplayedSetting
    {
        type: "option";
        options: string[];
        value: string;
        loop: boolean;
        onSet?: (C: Character, value: string, prevValue: string) => void;
    }
    interface TextSetting extends DisplayedSetting
    {
        type: "text";
        value: string;
        width: number | null;
        maxChars: number | null;
        onUnfocus?: (C: Character, value: string, prevValue: string) => void
    }
    interface NumberSetting extends DisplayedSetting
    {
        type: "number";
        value: number;
        width: number | null;
        min: number;
        max: number;
        step?: number;
        onUnfocus?: (C: Character, value: number, prevValue: number) => void
    }
    interface CustomSetting extends DisplayedSetting
    {
        type: "custom";
        /**
         * @param C The Character who you are viewing the settings for
         * @param hasPermission If the user has permission to edit the settings
         */
        OnClick: (C: PlayerCharacter, hasPermission: boolean) => void;
        /**
         * @param C The Character who you are viewing the settings for
         * @param hasPermission If the user has permission to edit the settings
         */
        OnExit: (C: PlayerCharacter, hasPermission?: boolean) => void;
        /**
         * @param C The Character who you are viewing the settings for
         * @param hasPermission If the user has permission to edit the settings
         */
        OnLoad: (C: PlayerCharacter, hasPermission?: boolean) => void;
        /**
         * @param C The Character who you are viewing the settings for
         * @param hasPermission If the user has permission to edit the settings
         */
        OnRun: (C: PlayerCharacter, hasPermission?: boolean) => void;
    }

    // Cumulative settings of all modules
    type BCBCSACategorySettings = Record<string, Setting>;
    type BCBCSASettings = Record<keyof typeof ModuleTitle, BCBCSACategorySettings>;

    // Storage of the settings as records, trimming everything but value
    type BCBCSARecord = Record<string, any>;
    type BCBCSARecords = Record<keyof typeof ModuleTitle, BCBCSARecord> 
        & {
            version: string,
            lastOnline: number
        };

    // Type used to create an activity
    type ActivityTrigger = (target: Character | undefined) => void;
    type ActivityReceived = (source: Character | undefined, target: Character| undefined, group: AssetGroupItemName, data: ServerChatRoomMessage) => void;
    type Prerequisite = (acting: Character, acted: Character, group: AssetGroup) => boolean;
    type NewPrerequisite = 
    {
        Name: string;
        Prerequisite?: (acting: Character, acted: Character, group: AssetGroup) => boolean;
    };
    type AllowedPrerequisites = ActivityPrerequisite | NewPrerequisites;
    interface CustomTarget
    {
        group: AssetGroupItemName;
        label: string;
        actionSelf?: string;
        actionOthers?: string;
    }
    interface CustomActivity extends Omit<Activity, "Name" | "ActivityID" | "Target" | "MaxProgress">
    {
        Name: string;
        Targets: CustomTarget[];
        Image: string;
        OnTrigger?: ActivityTrigger;
        OnReceive?: ActivityReceived;
        CustomPrerequisite?: NewPrerequisite | NewPrerequisite[];
        MaxProgress?: number;
    }

    interface BCBCSALocalStorage
    {
        lastOnline: number;
    }
}

export {};
