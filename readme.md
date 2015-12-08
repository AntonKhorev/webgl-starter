# WebGL starter code generator

**[Demo page][demo-en-base]**, generates html/javascript/glsl self-contained code for simple things like rotating triangles.

## What is it

This is a javascript library intended to be used on a web page that contains a *WebGL* example generator and provides the user interface for it.
The user interface consists of dropdown selectors and numeric inputs to tune the generated code, which is presented below the inputs.
The generated code is another web page that is supposed to be either saved by the user or opened in a new browser window.
The code looks as if it was hand-written.

## Usage

If you want to just use the generator, you can do it on **[demo page][demo-en-base]**.

If you want to include the generator on your page, you have to do the following:

1. Include [jQuery], possibly from CDN:
   ```html
   <script src="http://code.jquery.com/jquery-2.1.4.min.js"></script>
   ```

2. If you want syntax highlighting for generated code, include [highlight.js], possibly from CDN:
   ```html
   <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/styles/default.min.css">
   <script src="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js"></script>
   ```

3. Copy the generator library [css][lib-css] and [javascript][lib-js] files to your site and include them.

4. Put a `div` with class `webgl-starter` in a place where the generator is supposed to show up:
   ```html
   <div class="webgl-starter">message in case javascript is disabled</div>
   ```

See [demo page][demo-en-base] html source for example.

## Building from source

Build with [npm] and [gulp].

## Reasons behind this generator

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

The approach used here is to put all of the generated code into one html file.
This is done to help studying the code, so no code is away somewhere else.
For production use, it's up to the user to copy the necessary parts and paste them into different files.
This is supposed to be easier than picking the parts out of the library (if the user is unwilling to use the whole library), because the user has to deal with less code.

## References

Some of the examples used here are based on:

1. [*Interactive Computer Graphics with WebGL* course][esangel-course] by Edward Angel
2. Edward Angel, Dave Shreiner. *Interactive Computer Graphics, A top-down approach with WebGL*: [source code examples][esangel-code] from this book
3. [Mozilla Developer Network WebGL tutorial][mdn]
4. Code samples in [*Blinn–Phong shading model* Wikipedia article](https://en.wikipedia.org/w/index.php?title=Blinn%E2%80%93Phong_shading_model&oldid=689232543)

[demo-en-base]: http://antonkhorev.github.io/webgl-starter/en/base/
[lib-css]: http://antonkhorev.github.io/webgl-starter/lib/webgl-starter.css
[lib-js]: http://antonkhorev.github.io/webgl-starter/lib/webgl-starter.js
[jQuery]: https://jquery.com/
[highlight.js]: https://highlightjs.org/
[npm]: https://www.npmjs.com/
[gulp]: http://gulpjs.com/
[webgl-utils]: https://github.com/KhronosGroup/WebGL/blob/master/sdk/demos/common/webgl-utils.js
[webglstats]: http://webglstats.com/
[esangel-course]: https://www.coursera.org/course/webgl
[esangel-code]: https://github.com/esangel/WebGL
[mdn]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial
