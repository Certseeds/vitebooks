import * as rustydep from 'rustydep';
import rustydepsWasm from 'rustydep/rustydep_bg.wasm?url';
import pako from 'pako';

export const initRustDep = async () => {
    try {
        const response = await fetch(rustydepsWasm);
        const bytes = await response.arrayBuffer();
        const initOutput = rustydep.initSync({ module: bytes });
        console.log(initOutput);
        rustydep.greet("hello-world 2");
        return 'Rust Wasm Dep Initialized Successfully';
    } catch (error) {
        console.error('Error initializing RustDep:', error);
        return 'Failed to initialize RustDep';
    }
};

export const getdeps = async (name) => {
    try {
        const tarResponse = await fetch("https://vitebooks.certseeds.com/meta.tgz");
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.outer_function_from_cn(tarBuffer, name);
        return JSON.parse(results);
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}