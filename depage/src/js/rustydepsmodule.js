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
        const authors = JSON.parse(results); // { str:int, ... }
        const sortArray = Array
            .from(Object.entries(authors))
            .sort((a, b) => {
                return a[0].localeCompare(b[0])
            })
            .sort((a, b) => {
                return b[1] - a[1];
            });
        const map = new Map(sortArray);
        const authors_order = Array.from(map.keys());
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

export const get_faction_keywords = async () => {
    try {
        const tarResponse = await fetch(metaUrl);
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.get_faction_keywords(tarBuffer);
        const authors = JSON.parse(results); // { str:int, ... }
        const sortArray = Array
            .from(Object.entries(authors))
            .sort((a, b) => {
                return a[0].localeCompare(b[0])
            })
            .sort((a, b) => {
                return b[1] - a[1];
            });
        const map = new Map(sortArray);
        const faction_keywords = Array.from(map.keys());
        return faction_keywords;
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}

export const get_faction_keywords_map = async () => {
    try {
        const tarResponse = await fetch(metaUrl);
        const tarBytes = await tarResponse.arrayBuffer();
        const tarBuffer = pako.inflate(tarBytes);
        const results = rustydep.get_faction_keywords_map(tarBuffer);
        const elements = JSON.parse(results);
        const mapArray = Array.from([]);
        for (const element_key in elements) {
            const array = elements[element_key];
            const newSet = new Set();
            for (const element of array) {
                newSet.add((element?.chinese_name || element?.english_name));
            }
            mapArray.push([element_key, newSet]);
        }
        return new Map(mapArray);
    } catch (error) {
        console.error('Error Parse Package:', error);
        return ['failed to load'];
    }
}