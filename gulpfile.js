const gulp = require("gulp");
const gulpCopy = require("gulp-copy");
const path = require("path");
const shell = require("shelljs");

gulp.task("clean", done => {
  shell.rm("-rf", "dist");
  done();
});

gulp.task("copy-server", () => {
  //const serverFiles = ["./server/lib/**/*", "./server/public/**/*"];
  const serverFiles = [
    "./server/**/*",
    "./server/.gitignore",
    "!server/node_modules/**/*"
  ];

  const serverDest = "dist";

  return gulp.src(serverFiles).pipe(gulpCopy(serverDest, { prefix: 1 }));
});

gulp.task("copy-client", () => {
  const clientFiles = ["./client/build/**/*"];
  const destination = "dist/public";

  return gulp.src(clientFiles).pipe(gulpCopy(destination, { prefix: 2 }));
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

gulp.task("git-push", done => {
  shell.cd("dist");

  shell.exec("git add .");
  shell.exec("git commit -m automated");

  //shell.exec("git push");
  shell.exec("git push --set-upstream heroku master --force");

  shell.cd("..");

  done();
});

gulp.task("git-init", done => {
  shell.cd("dist");

  shell.exec("git init");
  shell.exec("git remote add heroku https://git.heroku.com/zotopia-power1.git");

  shell.cd("..");

  done();
});

gulp.task("deploy", gulp.series("build", "git-init", "git-push"));

//git.heroku.com/zotopia-power1.git
