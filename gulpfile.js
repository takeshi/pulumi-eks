var gulp = require('gulp');
const exec = require('child_process').exec;

gulp.task('watch', function(){
  gulp.watch('./*.ts',  gulp.task('preview'));
});

function run(cb,command){
  var spawn = require('child_process').spawn,
  preview    = spawn('pulumi', command,{ stdio: 'inherit' });
  preview.on('exit', function (code) {
    cb()
  });
}

gulp.task('preview', cb => {
  run(cb,["preview"])
});

gulp.task('default',gulp.task('watch'));
