
export function generateStartData(maxDepth = 5, minBreadth = 2, maxBreadth = 10, emptyChance = 0.5, firstAllowedEmptyDepth = 1, hugeFileChance = 0.1, emptyFileChance = 0.5) {
    const startData = { };
    const empty = firstAllowedEmptyDepth <= 0 && Math.random() < emptyChance;
    if (maxDepth > 0 && !empty) {
        const desiredBreadth = minBreadth + Math.round(Math.random() * (maxBreadth - minBreadth));
        for (let breadth = 0; breadth < desiredBreadth; breadth++) {
            if (!startData.children) {
                startData.children = [];
            }
            startData.children.push(generateStartData(maxDepth - 1, minBreadth, maxBreadth, emptyChance, firstAllowedEmptyDepth - 1, hugeFileChance, emptyFileChance))
        }
    }
    if (!startData.children || startData.children.length === 0) {
        startData.size = Math.random();
        if (Math.random() < hugeFileChance) {
            startData.size *= 10;
        }
        if (Math.random() < emptyFileChance) {
            startData.size = 0;
        }
    }
    return startData;
}

export function pickFile(data) {
    if (!data.children) {
        return data;
    }
    const index = Math.floor(Math.random() * data.children.length);
    return pickFile(data.children[index]);
}

export function smallAddition(file) {
    file.size += 0.1;
}

export function bigAddition(file) {
    file.size += 1;
}

export function smallDeletion(file) {
    file.size -= 0.1;
}

export function bigDeletion(file) {
    file.size -= 1;
}

export function deletion(file) {
    file.size = 0;
}

export const fileOperations = [
    smallAddition,
    bigAddition,
    smallDeletion,
    // bigDeletion,
    // deletion
] 


export function generateChange(data, iteration, contributors = 4, changes = 10) {
    data = structuredClone(data)

    const contributor = Math.floor(Math.random() * contributors) + 1

    for (let i = 0; i < changes; i++) {
        const file = pickFile(data);
        if (file.contributor && file.changeIteration === iteration) {
            continue;
        }
        file.contributor = contributor;
        file.changeIteration = iteration;
        const operation = Math.floor(Math.random() * fileOperations.length);
        fileOperations[operation](file);
    }

    return data;

}

export function generateData(iterations = 100, contributors = 5) {
    const data = [generateStartData()];
    sortData(data[0]);

    for (let i = 0; i < iterations; i++) {
        data.push(generateChange(data[i], i+1, contributors))
    }
    return data;
}

export function countLeafs(data) {
    return !data.children ? 1 : data.children.reduce((sum, child) => sum + countLeafs(child), 0);
}

export function sortData(data) {
    if (!data.children) {
        data.__size = data.size;
    } else {
        data.children.forEach(sortData);
        data.__size = data.children.reduce((sum, child) => sum + child.__size, 0)
        data.children.sort((a, b) => b.__size - a.__size);
    }
}