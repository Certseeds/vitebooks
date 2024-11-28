import * as rustydep from 'rustydep';
import rustydepsWasm from 'rustydep/rustydep_bg.wasm?url';
import pako from 'pako';

const metaUrl = "https://vitebooks.certseeds.com/meta.tgz";

export const initRustDep = async () => {
    try {
        const response = await fetch(rustydepsWasm);
        const bytes = await response.arrayBuffer();
        const initOutput = rustydep.initSync({ module: bytes });
        console.log(initOutput);
        return 'Rust Wasm Dep Initialized Successfully';
    } catch (error) {
        console.error('Error initializing RustDep:', error);
        return 'Failed to initialize RustDep';
    }
};

export const greet = () => {
    rustydep.greet();
}

export const getdeps = async (name) => {
    try {
        const tarResponse = await fetch(metaUrl);
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.outer_function_from_cn(tarBuffer, name);
        return JSON.parse(results);
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}

export const get_authors = async () => {
    try {
        const tarResponse = await fetch(metaUrl);
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.get_authors(tarBuffer);
        const authors = JSON.parse(results);
        const authors_order = authors.sort();
        console.log(authors_order);

        return authors_order;
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}

export const get_author_books = async (author) => {
    try {
        const tarResponse = await fetch(metaUrl);
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.get_author_books(tarBuffer, author);
        return JSON.parse(results);
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}