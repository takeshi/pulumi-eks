var gulp = require('gulp');
const exec = require('child_process').exec;

gulp.task('watch', function () {
  gulp.watch('./*.ts', gulp.task('preview'));
});

gulp.task('preview', cb => {
  var spawn = require('child_process').spawn,
    preview = spawn('pulumi', ["preview"], {
      stdio: 'inherit',
      env: {
        PULUMI_CONFIG_PASSPHRASE: ""
      }
    });
  preview.on('exit', function (code) {
    cb()
  });
});

gulp.task('default', gulp.task('watch'));
