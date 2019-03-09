#! /usr/bin/env node
const packageName = require("./package.json").name;
const shell = require("shelljs");
const argv = require("yargs").argv;
const pwd = shell.pwd().toString();

const userConfig = require(`${pwd}/${userConfigFileName}`);

const args = argv._.join(" ");

shell.env["DEPENDENT_STARTUP_PATH"] = pwd;
shell.cd(`node_modules/${packageName}`);

shell.exec(`npm run gulp ${args}`);