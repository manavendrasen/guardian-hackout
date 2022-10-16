import { Command, Flags } from "@oclif/core";
import { homedir } from "os";
import path from "path";
import { AuthTokens } from "../../common/services/AuthServices";
import { StorageService } from "../../common/services/StorageServices";
import { getProjectConfig } from "../../services/cliService";
import { readFile } from "../../services/initService";
import { getVarsForConfig } from "../../services/repoService";
let spawn = require("child_process").spawn,
  ls;

export default class RunCommand extends Command {
  static description = "Install the env variables during the run time";

  static flags = {
    command: Flags.string({
      char: "c",
      description: "command to run",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(RunCommand);

    const { configId } = getProjectConfig();

    const vars = await getVarsForConfig(configId);

    const arr = flags.command.split(" ");
    ls = spawn(arr[0], [arr.slice(1)], {
      env: { ...process.env, ...vars },
    });

    ls.stdout.on("data", function (data: any) {
      console.log(data.toString());
    });

    ls.stderr.on("data", function (data: any) {
      console.log(data.toString());
    });

  }
}
