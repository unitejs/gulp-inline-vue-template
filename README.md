# Gulp Inline Vue

This plugin will allow you to use url syntax in your template line to compile and inline templates in your source code.

Also any inline templates will be compiled as well.

# Installation

```
npm install gulp-inline-vue-template --save-dev
```

# Usage

If your template line looks like it is including a vue file then it will be compiled and inlined during the gulp pipe process.

myView.js
```
@Component({
    template: "./myView.vue"
})
export class MyView extends Vue {
}
```

myView.vue
```
<template>
    <span>Hello World!</span>
</template>
```

If you then pipe your source through the plugin during your gulp processing as follows:

```
var inlineVue = require('gulp-inline-vue-template');

gulp.task('inline-vue', function () {
  return gulp.src('./src/**/*.js')
    .pipe(inlineVue())
    .pipe(gulp.dest('./dist'));
});
```

Your output will be:

myView.js
```
@Component({
    template: function anonymous() {
        var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',[_vm._v("Hello World!")])
    }
})
export class MyView extends Vue {
}
```