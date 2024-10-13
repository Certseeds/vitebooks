const js = import("./node_modules/rustydeps/rustydep.js");
js.then((js) => {
    js.greet("WebAssembly");
});
