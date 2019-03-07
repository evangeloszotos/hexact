const gulp = require("gulp");

gulp.task("copy-server", () => {
  const serverFiles = ["/server/lib/**/*", "/server/public/**/*"];

  return gulp.src(serverFiles).pipe(gulp.dest("dist"));
});

gulp.task("default", () => {
  return gulp.src("package.json").pipe(gulp.dest("bbb"));
});
