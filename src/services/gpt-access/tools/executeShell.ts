import { JSONSchema } from "openai/lib/jsonschema";
import { FunctionDefinition } from "openai/resources";
import { Tools } from "../tools";
import { exec } from 'child_process';
import { promisify } from 'util';

Tools.register(Tools.ToolType.action, 'executeShellCommand', 'Execute a shell command',
    <JSONSchema>{
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'The command to be executed'
            }
        },
        required: ['command']
    },
    async (args: any) => {
        const execAsync = promisify(exec);
        const result = await execAsync(args.command);
        return JSON.stringify(result);
    }
);
