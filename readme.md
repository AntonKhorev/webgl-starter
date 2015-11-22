# WebGL starter code generator

**[Demo page][demo-en-base]**, generates html/javascript/glsl self-contained code for simple things like rotating triangles.

Build with [npm] and [gulp].

## What is it

Let's suppose there's a book or a course on some subject which has a set of examples in some programming language.
There can be a number of examples that are similar to each other or share a significant amount of common code.
This similarity is not what we'll necessarily find for any subject.
In case our subject is WebGL, however, it is likely to be found becaue:

* there is a common html structure of script inclusion, canvas element for output and typical inputs;
* there is a common javascript setup code that gets WebGL context and compiles shaders.

Instead of making a lot of small examples that are similar to each other, here we try to make a big one
with the possibility of including/excluding its parts.

## References

Some of the examples used here are based on:

1. [*Interactive Computer Graphics with WebGL* course][esangel-course] by Edward Angel
2. Edward Angel, Dave Shreiner. *Interactive Computer Graphics, A top-down approach with WebGL*: [source code examples][esangel-code] from this book
3. [Mozilla Developer Network WebGL tutorial][mdn]

[demo-en-base]: http://antonkhorev.github.io/webgl-starter/en/base/
[npm]: https://www.npmjs.com/
[gulp]: http://gulpjs.com/
[esangel-course]: https://www.coursera.org/course/webgl
[esangel-code]: https://github.com/esangel/WebGL
[mdn]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial
