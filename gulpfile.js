const gulp = require("gulp");
const gulpCopy = require("gulp-copy");
const path = require("path");
const shell = require("shelljs");
const opn = require("opn");
const gti = require("gulp-task-if");
var _mergeWith = require("lodash.mergewith");
const settings = require("./settings");

const rootWorkingDirectory =
  process.env["DEPENDENT_STARTUP_PATH"] || shell.pwd().toString();
const defaultConfig = require(`./${settings.defaultConfigFilename}`);

const userConfig = require(path.join(
  rootWorkingDirectory,
  settings.userConfigFilename
));

function keepUserArrayCustomizer(objValue, srcValue) {
  if (Array.isArray(srcValue)) {
    return srcValue;
  }
}

if (userConfig.serverRoot && !userConfig.server) {
  userConfig.server = {
    root: userConfig.serverRoot
  };
}

if (userConfig.clientRoot && !userConfig.client) {
  userConfig.client = {
    root: userConfig.clientRoot
  };
}

if (userConfig.ignoreClient && !userConfig.client) {
  userConfig.client = {
    isActive: !userConfig.ignoreClient
  };
}

const config = _mergeWith(defaultConfig, userConfig, keepUserArrayCustomizer);
console.log(config);

const appNamePlaceHolder = ":appName";
const clientRootPlaceHolder = ":root";

function setEnvironment(config, url) {
  config.appName = url;
}

function cdRoot() {
  shell.cd(rootWorkingDirectory);
}

Object.keys(config.apps).forEach(environmentKey => {
  gulp.task(environmentKey, done => {
    console.log(environmentKey);
    setEnvironment(config, config.apps[environmentKey]);
    done();
  });
});

gulp.task("check-gitUrl", done => {
  if (!config.appName) {
    throw new Error("Environment not set!");
  }

  done();
});

gulp.task("clean", done => {
  cdRoot();
  shell.rm("-rf", config.buildRoot);
  done();
});

gulp.task("copy-server", () => {
  cdRoot();
  const serverFiles = [
    `${config.server.root}/**/*`,
    `${config.server.root}/**/.*`,
    `!${config.server.root}/node_modules/**/*`
  ];

  return gulp.src(serverFiles).pipe(gulpCopy(config.buildRoot, { prefix: 0 }));
});

function renderTemplate(tmpl, placeholder, value) {
  return tmpl.replace(placeholder, value);
}

gulp.task("copy-client", () => {
  cdRoot();

  let clientFiles = [];

  if (config.client) {
    if (config.client.precopy) {
      clientFiles.push(
        `${renderTemplate(
          config.client.public,
          clientRootPlaceHolder,
          config.client.root
        )}/**/*`
      );
    }

    if (config.client.exclude) {
      config.client.exclude.forEach(excludePattern => {
        clientFiles.push(`!${config.client.root}/**/*${excludePattern}`);
      });
    }
  }

  const publicFolder = path.join(config.buildRoot, config.server.public);
  return gulp.src(clientFiles).pipe(gulpCopy(publicFolder, { prefix: 3 }));
});

gulp.task("precopy-client", done => {
  console.log("Hello from precoppy"), cdRoot();
  if (config.client) {
    if (config.client.precopy) {
      config.client.precopy.forEach(command => {
        command[1] = command[1].replace(
          clientRootPlaceHolder,
          config.client.root
        );

        shell[command[0]](command[1]);
      });
    }
  }

  done();
});

gulp.task(
  "process-client",
  gulp.series(gti(config.client.isActive, "precopy-client", "copy-client"))
);

gulp.task("build", gulp.series("clean", "copy-server", "process-client"));

gulp.task("git-init", done => {
  cdRoot();

  const gitUrl = config.gitUrlPattern.replace(
    appNamePlaceHolder,
    config.appName
  );

  shell.cd(config.buildRoot);

  shell.exec("git init");
  shell.exec(`git remote add heroku ${gitUrl}`);

  done();
});

function createApp() {
  console.log("creating: " + config.appName);
  const herokuCreateResult = shell.exec(`heroku create ${config.appName}`);

  if (herokuCreateResult.stderr.includes("already taken")) {
    console.log("EXISTS ALREADY!");
  } else {
    console.log("Created!");
  }
}

gulp.task("git-push", done => {
  cdRoot();
  createApp();

  shell.cd(config.buildRoot);

  shell.exec("git add .");
  shell.exec("git commit -m deplyment");
  shell.exec("git push --set-upstream heroku master --force");

  done();
});

gulp.task(
  "deploy",
  gulp.series("check-gitUrl", "build", "git-init", "git-push", "clean")
);

gulp.task("install-client", done => {
  cdRoot();
  shell.cd(config.client.root);

  console.log("Run: npm install");

  shell.exec("npm install");

  console.log("client installed");
  done();
});

gulp.task(
  "local",
  gulp.series("build", done => {
    cdRoot();
    shell.cd(config.buildRoot);

    console.log("Run: npm install");

    shell.env["NODE_ENV"] = "production";
    shell.exec("npm install");

    console.log("starting local build!");

    shell.exec("npm start");

    done();
  })
);

gulp.task("open", done => {
  const webUrl = config.webUrlPattern.replace(
    appNamePlaceHolder,
    config.appName
  );

  console.log("opening: " + webUrl);
  opn(webUrl, { wait: false });
  done();
});

gulp.task("print-gitUrl", done => {
  console.log("gitUrl: " + config.appName);

  done();
});

gulp.task("hw", done => {
  console.log("hello world!");
  done();
});
