// noinspection JSUnusedGlobalSymbols

export type Snowflake = string

export type CompiledCommand = {
    name: string
    description: string
    options: ApplicationCommandOption[]
}

export type ApplicationCommand = {
    id: Snowflake
    application_id: Snowflake
    name: string
    description: string
    options?: ApplicationCommandOption[]
    default_permission?: boolean
}

export type ApplicationCommandOption = {
    type: ApplicationCommandOptionType
    name: string
    description: string
    required?: boolean
    choices?: ApplicationCommandOptionChoice[],
    options?: ApplicationCommandOption[]
}

export type ApplicationCommandOptionChoice = {
    name: string
    value: string | number
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8
}

export function compileCommands(commands: ApplicationCommand[]): CompiledCommand[] {
    const compiled: CompiledCommand[] = []
    for (let command of commands) {
        compiled.push(...__compileCommand(command))
    }
    return compiled.sort((a,b) => (a.name > b.name) ? 1 : -1)
}

export function getOptionTypeName(option: ApplicationCommandOption): string {
    return ApplicationCommandOptionType[option.type]
}

function __compileCommand(command: ApplicationCommand): CompiledCommand[] {
    const list: CompiledCommand[] = []
    const hasSubcommandsGroups = __hasSubcommandsGroups(command)
    const hasSubcommands = __hasSubcommands(command)

    if (!hasSubcommands && !hasSubcommandsGroups) {
        list.push({ name: command.name, description: command.description, options: command.options })
    } else {
        for (let option of command.options) {
            list.push(...__compileCommandFromOption(command, option))
        }
    }

    return list
}

function __compileCommandFromOption(command: ApplicationCommand, option: ApplicationCommandOption): CompiledCommand[] {
    const array: CompiledCommand[] = []

    if (option.type !== ApplicationCommandOptionType.SUB_COMMAND && option.type !== ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
        return array
    }

    if (option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
        array.push(...__compileSubcommandGroup(command.name, option))
    } else if (option.type === ApplicationCommandOptionType.SUB_COMMAND) {
        array.push(__compileSubcommand(command.name, option))
    }

    return array
}

function __compileSubcommand(baseName: string, option: ApplicationCommandOption): CompiledCommand {
    return {
        name: `${baseName} ${option.name}`,
        options: option.options,
        description: option.description
    }
}

function __compileSubcommandGroup(baseName: string, group: ApplicationCommandOption): CompiledCommand[] {
    const array: CompiledCommand[] = []

    if (__hasSubcommands(group)) {
        for (let option of group.options) {
            array.push(__compileSubcommand(`${baseName} ${group.name}`, group))
        }
    }

    return array
}

function __hasSubcommandsGroups(command: ApplicationCommand): boolean {
    return command.options
        && command.options.find((sc) => {
            return sc.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
        }) != null
}

function __hasSubcommands(command: ApplicationCommand | ApplicationCommandOption): boolean {
    return command.options
        && command.options.find((sc) => {
            return sc.type === ApplicationCommandOptionType.SUB_COMMAND
        }) != null
}