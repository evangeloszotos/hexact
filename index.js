#! /usr/bin/env node
const packageName = require("./package.json").name;
const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const yargs = require("yargs");
const argv = yargs.argv;
const pwd = shell.pwd().toString();
const settings = require("./settings");

// yargs.version("1.1.0");
// Create add command
yargs.command({
  command: "init",
  describe: "Create a new config file",
  builder: {
    /*
        body: {
            describe: 'Note body',
            demandOption: true,
            type: 'string'
        },
        ignore:{
            alias: 'i',
            type: 'boolean'
        }
        */
  },
  handler(argv) {
    const src = `./node_modules/${packageName}/${
      settings.defaultUserConfigFilename
    }`;
    const dest = `${settings.userConfigFilename}`;

    const exists = fs.existsSync(dest);

    if (!exists) {
      shell.cp(src, dest);
      console.log("hexact.json created");
    } else {
      console.log("hexact.json already exists! - delete it and try again");
    }
  }
});

yargs.command({
  command: "*",
  describe: "Perform default behaviour",
  handler(argv) {
    defaultCommand();
  }
});

yargs.parse();

function defaultCommand() {
  shell.env["DEPENDENT_STARTUP_PATH"] = pwd;

  try {
    const userConfig = require(path.join(pwd, settings.userConfigFilename)); // just access it to check existance!

    const args = argv._.join(" ");

    if (argv._.length > 0) {
      shell.cd(`node_modules/${packageName}`);
      shell.exec(`npm run gulp ${args}`);
    } else {
      console.log("No task specified!");
      console.log("use: hexact local");
      console.log("or : hexact dev deploy");
    }
  } catch (e) {
    console.log("No hexac.json found, please run: 'hexac init' to create one");
  }
}
