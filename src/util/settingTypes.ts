export function IsSetting(setting: any): setting is Setting
{
    const set = setting as Setting;
    return (
        typeof set.name === "string"
        && ["checkbox", "option", "text", "number", "record", "custom"].includes(set.type)
        && set.value !== undefined
    );
}
export function IsDisplaySetting(setting: Setting): setting is DisplayedSetting
{
    const set = setting as DisplayedSetting;
    return (
        IsSetting(setting)
        && typeof set.active === "function"
        && typeof set.label === "string"
    );
}
export function IsCheckboxSetting(setting: Setting): setting is CheckboxSetting
{
    const set = setting as CheckboxSetting;
    return (
        IsDisplaySetting(setting)
        && set.type === "checkbox"
        && typeof set.value === "boolean"
        && (typeof set.doNotModify === "function" || typeof set.doNotModify === "undefined")
    );
}
export function IsOptionSetting(setting: Setting): setting is OptionSetting
{
    const set = setting as OptionSetting;
    return (
        IsDisplaySetting(setting)
        && set.type === "option"
        && typeof set.value === "string"
        && Array.isArray(set.options)
        && typeof set.loop === "boolean"
    );
}
export function IsTextSetting(setting: Setting): setting is TextSetting
{
    const set = setting as TextSetting;
    return (
        IsDisplaySetting(setting)
        && set.type === "text"
        && typeof set.value === "string"
        && (typeof set.width === "number" || set.width === null)
        && (typeof set.maxChars === "number" || set.maxChars === null)
    );
}
export function IsNumberSetting(setting: Setting): setting is NumberSetting
{
    const set = setting as NumberSetting;
    return (
        IsDisplaySetting(setting)
        && set.type === "number"
        && typeof set.value === "number"
        && (typeof set.width === "number" || set.width === null)
        && typeof set.min === "number"
        && typeof set.max === "number"
        && (typeof set.step === "number" || typeof set.step === "undefined")
        && (typeof set.onUnfocus === "function" || typeof set.onUnfocus === "undefined")
    );
}
export function IsCustomSetting(setting: Setting): setting is CustomSetting
{
    const set = setting as CustomSetting;
    return (
        IsDisplaySetting(setting)
        && setting.type === "custom"
        && typeof set.OnClick === "function"
        && typeof set.OnExit === "function"
        && typeof set.OnLoad === "function"
        && typeof set.OnRun === "function"
    );
}
