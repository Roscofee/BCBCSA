import { Module, ModuleTitle } from "@/modules/_module";

import clicker from "@assets/clicker.mp3";

export class ExampleModule extends Module
{
    get Title(): ModuleTitle
    {
        return ModuleTitle.Example;
    }

    get Public(): boolean
    {
        return true;
    }

    get DisplayInSettings(): boolean
    {
        return true;
    }

    get Activities(): CustomActivity[]
    {
        return [
            {
                Name: "Example Activity",
                Prerequisite: ["UseHands"],
                CustomPrerequisite: {
                    Name: "CustomPreReq",
                    Prerequisite: (_acting, _acted, _group) =>
                    {
                        // Whatever condition based on who doing the action against who and on what group
                        return true;
                    }
                },
                Targets: [{
                    group: "ItemHands",
                    label: "Handshake",
                    actionOthers: "SourceCharacter gives a firm handshake to TargetCharacter.",
                    actionSelf: "SourceCharacter gives a handshake to themself."
                }],
                Image: "Assets\\Female3DCG\\ItemDevices\\Preview\\Bed.png",
                OnTrigger: (_Character) =>
                {
                    // Code callback to trigger anything you want when YOU are doing the activity to someone else
                    console.log("I shook someone's hand");
                    // Play a sound
                    const audio = new Audio(clicker);
                    audio.play();
                },
                OnReceive: (_source, _target, _group, _data) =>
                {
                    // Code callback to trigger anything you want when SOMEONE ELSE does the activity to you
                    console.log("Someone shook my hand");
                }
            }
        ];
    }

    get Settings(): Setting[]
    {
        return [
            {
                name: "checkboxInput",
                type: "checkbox",
                active: (_Character) => true,
                value: false,
                label: "Check this box",
                doNotModify: (Character) => !Character.IsPlayer(),
                onSet: (Character, value, _previousValue) =>
                {
                    console.log(`${Character.Nickname || Character.Name} pressed checkboxInput - ${value}`);
                }
            } as CheckboxSetting, {
                name: "numberInput",
                type: "number",
                value: 1,
                active: (_Character) => true,
                label: "Enter a number [1-10]",
                width: 128,
                min: 1,
                max: 10,
                step: 1,
                onUnfocus: (Character, value, prevValue) =>
                {
                    console.log(`${Character.Nickname || Character.Name} changed the value from ${prevValue} to ${value}`);
                }
            } as NumberSetting, {
                name: "textInput",
                type: "text",
                active: (_C) => true,
                value: "Example of string changing",
                label: "Some test string",
                maxChars: 1024,
                width: 1024,
                onUnfocus: (C, value, prevValue) =>
                {
                    console.log(`${C.Nickname || C.Name} changed the value from ${prevValue} to ${value}`);
                }
            } as TextSetting, {
                name: "optionInput",
                type: "option",
                active: (_Character) => true,
                value: "Off",
                options: ["Off", "Low", "Medium", "High"],
                label: "Pick an option",
                loop: false,
                onSet: (C, value, prevValue) =>
                {
                    console.log(`${C.Nickname || C.Name} changed the value from ${prevValue} to ${value}`);
                }
            } as OptionSetting, {
                name: "localData",
                type: "record",
                value: {
                    somethingImportant: 1
                }
            } as Setting
        ];
    }

    Load(): void
    {
        super.Load();
    }

    Unload(): void
    {
        super.Unload();
    }
}
