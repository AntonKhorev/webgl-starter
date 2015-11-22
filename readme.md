# WebGL starter code generator

**[Demo page][demo-en-base]**, generates html/javascript/glsl self-contained code for simple things like rotating triangles.

Build with [npm] and [gulp].

## What is it

Let's suppose there's a book or a course on some subject which has a set of examples in some programming language.
There can be a number of examples that are similar to each other or share a significant amount of common code.
This similarity is not what we'll necessarily find for any subject.
In case our subject is *WebGL*, however, it is likely to be found becaue:

* there is a common html structure of script inclusion, canvas element for output and typical inputs;
* there is a common javascript setup code that gets *WebGL* context and compiles shaders.

Instead of making a lot of small examples that are similar to each other, here we try to make a big one
with the possibility of including/excluding its parts.

An obvious alternative approach is to make a library with common code.
Some problems with this approach are:

* It becomes impossible to see all of the relevant code at a glance.
  Only a small part of this library is going to be used for any particular example.
  Anyone who studies the code will have to search through the library for relevant parts.
  If they give up on searching, the code becomes "hidden" inside the library.
* It may not be obvious if a function call in the example is a standard function or a library function.
  An example of such a function is `requestAnimFrame` from [webgl-utils] which looks like a standard function `requestAnimationFrame`
  (for a reason of being its wrapper).
* The common code can be in different languages: *JavaScript*, *OpenGL Shading Language*, *HTML* and possibly *CSS*.
  Usually only *JavaScript* code is in the library, the rest is copied across the examples.
* People who look at the examples want to study *WebGL*, not the library.
  Will you recommend your library to be used in production code?
  Maybe not if it was written purely for teaching.
  The library is not necessary to achieve the desired result, other approaches may work better.
  For example, `requestAnimFrame` wrapper mentioned above is not useful nowadays because `requestAnimationFrame` [is supported by 100% of the browsers][webglstats] that support *WebGL*.
  The generator presented here may not be the best programming either, but most of its potentially questionable code stays inside it.
  The generated code does not require the generator to function.

## References

Some of the examples used here are based on:

1. [*Interactive Computer Graphics with WebGL* course][esangel-course] by Edward Angel
2. Edward Angel, Dave Shreiner. *Interactive Computer Graphics, A top-down approach with WebGL*: [source code examples][esangel-code] from this book
3. [Mozilla Developer Network WebGL tutorial][mdn]

[demo-en-base]: http://antonkhorev.github.io/webgl-starter/en/base/
[npm]: https://www.npmjs.com/
[gulp]: http://gulpjs.com/
[webgl-utils]: https://github.com/KhronosGroup/WebGL/blob/master/sdk/demos/common/webgl-utils.js
[webglstats]: http://webglstats.com/
[esangel-course]: https://www.coursera.org/course/webgl
[esangel-code]: https://github.com/esangel/WebGL
[mdn]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial
