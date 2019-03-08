const gulp = require("gulp");
const gulpCopy = require("gulp-copy");
const path = require("path");
const shell = require("shelljs");

const config = require("./deployer.config.json");

const opn = require("opn");

function setEnvironment(config, url) {
  config.appName = url;
}

Object.keys(config.env).forEach(environmentKey => {
  gulp.task(environmentKey, done => {
    console.log(environmentKey);
    setEnvironment(config, config.env[environmentKey]);
    done();
  });
});

// set dev url as default
//setEnvironment(config, config.env.dev);

gulp.task("kk", done => {
  console.log(process.argv);
  done();
});

gulp.task("check-gitUrl", done => {
  if (!config.appName) {
    throw new Error("Environment not set!");
  }

  done();
});

gulp.task("clean", done => {
  shell.rm("-rf", config.server.root);
  done();
});

gulp.task("copy-server", () => {
  //const serverFiles = ["./server/lib/**/*", "./server/public/**/*"];
  const serverFiles = [
    "./server/**/*",
    "./server/.gitignore",
    "!server/node_modules/**/*"
  ];

  return gulp
    .src(serverFiles)
    .pipe(gulpCopy(config.server.root, { prefix: 1 }));
});

gulp.task("copy-client", () => {
  const clientFiles = ["./client/build/**/*"];
  const publicFolder = path.join(config.server.root, config.server.publicPath);

  return gulp.src(clientFiles).pipe(gulpCopy(publicFolder, { prefix: 2 }));
});

gulp.task("build-client", done => {
  shell.cd("client");
  shell.exec("npm run build");
  shell.cd("..");
  done();
});

gulp.task(
  "build",
  gulp.series("clean", "copy-server", "build-client", "copy-client")
);

gulp.task("git-init", done => {
  const gitUrlPattern =
    config.gitUrlPattern || "https://git.heroku.com/:appName.git";

  const gitUrl = gitUrlPattern.replace(":appName", config.appName);

  shell.cd(config.server.root);

  shell.exec("git init");
  shell.exec(`git remote add heroku ${gitUrl}`);

  shell.cd("..");
  done();
});

function createApp() {
  console.log("creating: " + config.appName);
  const v = shell.exec(`heroku create ${config.gitUrl}`);

  if (v.stderr.includes("already taken")) {
    console.log("EXISTS ALREADY!");
  } else {
    console.log("Created!");
  }
}

gulp.task("git-push", done => {

  createApp();

  shell.cd(config.server.root);

  shell.exec("git add .");
  shell.exec("git commit -m deplyment");
  shell.exec("git push --set-upstream heroku master --force");

  shell.cd("..");
  done();
});

gulp.task(
  "deploy",
  gulp.series("check-gitUrl", "build", "git-init", "git-push", "clean")
);

gulp.task("open", done => {
  const webUrlPattern =
    config.webUrlPattern || "https://:appName.herokuapp.com";

  const webUrl = webUrlPattern.replace(":appName", config.appName);

  console.log("opening: " + webUrl);
  opn(webUrl, { wait: false });
  done();
});

gulp.task("print-gitUrl", done => {
  console.log("gitUrl: " + config.appName);

  done();
});

//git.heroku.com/zotopia-power1.git
