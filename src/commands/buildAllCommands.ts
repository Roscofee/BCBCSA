// YOU SHOULD NOT NEED TO MODIFY THIS FILE
//
// To add commands (or really any code to run one time on startup), create a
// file in commands directory. Then export function CreateCommand() to that
// new file. CreateCommand will be called once during addon initialization.

interface CommandClass
{
    Run: () => void;
}

export function BuildAllCommands()
{
    const context = require.context("@/commands", false, /\.ts$/);

    context.keys().forEach((key: string) =>
    {
        const module: CommandClass = context(key);

        if (typeof module.Run === "function")
        {
            module.Run();
        }
    });
}
