// 输入是一个[book1, book2,...]数组
// 在内部为每个book生成唯一id, 并利用
// "recommended_reading"字段, 为book生成依赖关系, 直接生成唯一id
export const torender = (obj) => {
    const nameMap = new Map();
    const idMap = new Map();
    const seriesMap = new Map();
    for (const element of obj) {
        nameMap.set(element.chinese_name, element);

        const seriesName = `${element.series.name} ${element.series.order}`;
        element.id = `${element.chinese_name} ${seriesName}`; // `荷鲁斯崛起 Horus Heresy 1`
        idMap.set(element.id, element);

        // 随后为每一个`${element.series.name} ${element.series.order}`生成一个数组, 内部存储所有这本书的book, 方便优化查找时间
        let series = seriesMap.get(seriesName);
        if (!series) {
            series = [];
            seriesMap.set(seriesName, series);
        }
        series.push(element);
    }
    // 随后对所有的book进行查找, 先按
    for (const element of obj) {
        for (const rec_read of element?.recommended_reading ?? []) {
            if (typeof rec_read === 'string') {
                const book = nameMap.get(rec_read);
                element.dependencies = element.dependencies || [];
                element.dependencies.push(book.id);
                // 处理找到的 book, 例如添加到依赖关系
            } else if (typeof rec_read === 'object') {
                if (nameMap.has(rec_read.name)) {
                    const book = nameMap.get(rec_read.name);
                    element.dependencies = element.dependencies || [];
                    element.dependencies.push(book.id);
                } else if (rec_read.series && rec_read.series !== null) {
                    const seriesName = `${rec_read.series.name} ${rec_read.series.order}`;
                    const series = seriesMap.get(seriesName);
                    if (series) {
                        for (const book of series) {
                            if (book.name === rec_read.name || book.enname === rec_read.enname) {
                                element.dependencies = element.dependencies || [];
                                element.dependencies.push(book.id);
                            }
                        }
                    }
                } else {
                    const seriesName = `${rec_read.belongto.series.name} ${rec_read.belongto.series.order}`;
                    const series = seriesMap.get(seriesName);
                    if (series) {
                        for (const book of series) {
                            if (book.name === rec_read.name || book.enname === rec_read.enname) {
                                element.dependencies = element.dependencies || [];
                                element.dependencies.push(book.id);
                            }
                        }
                    }
                }
            }
        }
    }
    return obj;
}