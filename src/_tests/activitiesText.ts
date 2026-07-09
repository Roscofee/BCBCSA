import template from "../localization/template.json";
import { modules } from "../util/registerModules";

export function ActivitiesTest()
{
    // Get all the labels of all the settings
    const buttonLabels: string[] = [];
    const actionText: string[] = [];
    for (const module of modules)
    {
        module.Activities.forEach((activity) =>
        {
            activity.Targets.forEach((target) =>
            {
                if (!buttonLabels.includes(target.label))
                {
                    buttonLabels.push(target.label);
                }
                if (target.actionSelf && !actionText.includes(target.actionSelf))
                {
                    actionText.push(target.actionSelf);
                }
                if (target.actionOthers && !actionText.includes(target.actionOthers))
                {
                    actionText.push(target.actionOthers);
                }
            });
        });
    }

    // Ensure all the button labels exists in the localization template
    const labelsNotInTemplate: string[] = [];
    for (const label of buttonLabels)
    {
        if (!(label in template))
        {
            labelsNotInTemplate.push(label);
        }
    }
    if (labelsNotInTemplate.length === 0)
    {
        console.log("All activity button labels are found in the localization template");
    }
    else
    {
        console.log(`The following button labels are missing from the localication template:\n"${labelsNotInTemplate.join("\":\"\",\n\"")}":""`);
    }

    // Ensure all the action text in the localization template
    const actionsNotInTemplate: string[] = [];
    for (const text of actionText)
    {
        if (!(text in template))
        {
            actionsNotInTemplate.push(text);
        }
    }
    if (actionsNotInTemplate.length === 0)
    {
        console.log("All activity button labels are found in the localization template");
    }
    else
    {
        console.log(`The following button labels are missing from the localication template:\n"${actionsNotInTemplate.join("\":\"\",\n\"")}":""`);
    }
}
