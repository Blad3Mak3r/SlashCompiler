import yargs = require('yargs/yargs');
import axios from 'axios';
import {ApplicationCommand, ApplicationCommandOption, compileCommands, CompiledCommand} from "./src";

const tablemark = require("tablemark");

interface TableCommand {
    name: string
    description: string
}

interface Arguments {
    id: string
    token: string
    guild?: string
}

// @ts-ignore
const args: Arguments = yargs(process.argv.slice(2)).options({
    id: { type: 'string', demandOption: true, alias: 'i', description: 'Bot ID.' },
    token: { type: 'string', demandOption: true, alias: 't', description: 'Bot token.' },
    guild: { type: 'string', demandOption: false, alias: 'g', description: 'Fetch per guild commands.' }
}).argv;

const token = args.token
const id = args.id

const authorization = `Bot ${token}`

const GLOBAL_COMMANDS = `https://discord.com/api/v9/applications/${id}/commands`
const GUILD_COMMANDS = `https://discord.com/api/v9/applications/${id}/commands/guild/`

function buildUsageFromArguments(command: CompiledCommand): string {
    let str = "/"

    str += "**"
    str += command.name
    str += "**"
    str += " "

    if (!command.options) return str.trim()

    for (let i = 0; i <  command.options.length; i++) {
        let argument = command.options[i]

        if (argument.required) str += "(`"
        else str += "[`"

        str += argument.name

        if (argument.required) str += "`)"
        else str += "`]"

        str += ""
    }

    return str.trim()
}

function createTableCommand(c: CompiledCommand): TableCommand {
    return {
        name: buildUsageFromArguments(c),
        description: c.description,
    }
}

async function start() {

    const commands = await (!args.guild ? fetchGlobalCommands() : fetchGuildCommands())
    const table = tablemark(commands.map((c) => createTableCommand(c)))

    console.log("========== Compiled commands ==========")
    console.log(commands)
    console.log("=======================================")
    console.log("\n")

    console.log("=========== Table Commands ============")
    console.log(table)
    console.log("=======================================")
}

async function fetchGlobalCommands(): Promise<CompiledCommand[]> {
    const result = await axios.get<ApplicationCommand[]>(GLOBAL_COMMANDS, {headers: {'authorization': authorization}})
    const commands = result.data

    return compileCommands(commands)
}

async function fetchGuildCommands(): Promise<CompiledCommand[]> {
    return []
}

start().then(() => console.log("Success!")).catch(console.error)