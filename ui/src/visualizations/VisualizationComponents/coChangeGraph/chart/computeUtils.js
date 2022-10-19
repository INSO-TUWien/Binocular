import { file } from "jszip";

export function computeFileDependencies(props){
    if(props.commitsFiles === undefined){
        console.error("Error: commitsFiles is undefined!");
        return null;
    }

    const commitsFiles = props.commitsFiles;
    let commitCntPerFile = [];
    let sharedCommitCnt = [];
    let fileSet = new Set();

    // extract the amount of commits in which each two files are involved
    for (const commit of commitsFiles) {
        const files = commit.files.data;

        for (const srcFileHolder of files) {
            const srcFile = srcFileHolder.file.path;

            if(commitCntPerFile[srcFile] === undefined) commitCntPerFile[srcFile] = 0;
            commitCntPerFile[srcFile] += 1;

            fileSet.add(srcFile);

            for (const dstFileHolder of files){
                const dstFile = dstFileHolder.file.path;

                if(srcFile == dstFile) continue;

                validateSharedCommitCnt(sharedCommitCnt, srcFile, dstFile);
                sharedCommitCnt[srcFile][dstFile] += 1;
            }
        }
    }

    if(props.pathFilter != undefined && props.pathFilter != ""){
        fileSet = filterEntities(props.pathFilter, fileSet);
    } else {
        fileSet = filterEntities("ui/src/visualizations", fileSet);
    }

    let dataset = computeDependencyDataset(fileSet, sharedCommitCnt, commitCntPerFile);
    dataset = filterDependencyDataset(dataset, props.lowerBounds);
    return dataset;
}

// Same as computeFileDependencies for now, but for modules
export function computeModuleDependencies(props){
    if(props.commitsModules === undefined){
        console.error("Error: commitsModules is undefined!");
        return null;
    }

    const commitsModules  = props.commitsModules;
    let commitCntPerModule = [];
    let sharedCommitCnt = [];
    let moduleSet = new Set();

    // extract the amount of commits in which each two modules are involved
    for (const commit of commitsModules) {
        const modules = commit.modules.data;

        for (const srcModuleHolder of modules) {
            const srcModule = srcModuleHolder.module.path;

            if(commitCntPerModule[srcModule] === undefined) commitCntPerModule[srcModule] = 0;
            commitCntPerModule[srcModule] += 1;

            moduleSet.add(srcModule);

            for (const dstModuleHolder of modules){
                const dstModule = dstModuleHolder.module.path;

                if(srcModule == dstModule) continue;

                validateSharedCommitCnt(sharedCommitCnt, srcModule, dstModule);
                sharedCommitCnt[srcModule][dstModule] += 1;
            }
        }
    }

    moduleSet = filterEntities(props.pathFilter, moduleSet);
    let dataset = computeDependencyDataset(moduleSet, sharedCommitCnt, commitCntPerModule);

    dataset.nodes.forEach(node => {
        node.name = node.id;
        node.type = "m"
    })

    return dataset;
}

function filterEntities(name, entitySet){
    entitySet = Array.from(entitySet);
    entitySet = entitySet.filter(_ => _.includes(name));
    return entitySet;
}

/*
* Checks if the sharedCommitCnt array is initialized
*/
function validateSharedCommitCnt(sharedCommitCnt, srcFile, dstFile) {
    if(sharedCommitCnt[srcFile] === undefined){
        sharedCommitCnt[srcFile] = [];
    }

    if(sharedCommitCnt[srcFile][dstFile] === undefined){
        sharedCommitCnt[srcFile][dstFile] = 0;
    }
}



/*
*
* Computes the dependencies and the resulting dataset for d3 to visualize
* Takes:    {entitySet}, a Set containing all entities (e.g. files, modules)
*           {sharedCommitCnt}, an array['src']['dst'] containing the amount of commits shared by 2 entities
*           {commitCntPerEntity}, an array['entity'] containing the count of all commits an entity is involved in
* Produces: {dataset}, containing all entities as nodes, and the dependencies as edges
*/

function computeDependencyDataset(entitySet, sharedCommitCnt, commitCntPerEntity){
    let dependencies = [];
    let dependencyCnt = 0;
    entitySet = Array.from(entitySet); //convert to Array for ease of use

    // compute the dependencies
    for (const srcEntity of entitySet) {

        if(sharedCommitCnt[srcEntity] === undefined) continue;

        // iterate over all keys of sharedCommitCnt[srcEntity]
        // and compute both sides of the dependency
        Object.keys(sharedCommitCnt[srcEntity]).forEach(dstEntity => {
            const srcCoChange = sharedCommitCnt[srcEntity][dstEntity] / commitCntPerEntity[srcEntity]   //cochange percentage from source POV
            const dstCoChange = sharedCommitCnt[srcEntity][dstEntity] / commitCntPerEntity[dstEntity]    //cochange percentage from destination POV 

            // get indices used in graph
            const srcIndex = entitySet.findIndex(_ => _ === srcEntity);
            const dstIndex = entitySet.findIndex(_ => _ === dstEntity);
            
            // only add link if indices can be found
            if(srcIndex != -1 && dstIndex != -1) {
                
                const link = {
                    source: srcIndex,    // needed for d3 to create the graph
                    target: dstIndex,
                    sourceColor: srcCoChange,
                    targetColor: dstCoChange,
                    uuid: dependencyCnt
                }
                
                const key = srcEntity + ":" + dstEntity;
                const reverseKey = dstEntity + ":" + srcEntity;
    
                // check both directions to avoid duplicates
                if (dependencies[key] === undefined && dependencies[reverseKey] === undefined) {
                    // do not draw links with zero dependency
                    if(srcCoChange != 0 || dstCoChange != 0){   
                        dependencies[key] = link;
                        dependencyCnt++;
                    }
                }
            }
        });
    }

    let dependencyArray = [];

    // convert to array for ease of use
    Object.keys(dependencies).forEach(function(key) {
        dependencyArray.push(dependencies[key]);
    });

    // convert entitySet to objects for d3
    let entitys = [];
    for (const entity of entitySet) {
        entitys.push({id: entity});
    }

    const dataset = {
        nodes: entitys,
        links: dependencyArray
    }

    return dataset;
}


/*
* Removes links which have a dependency below the threshold
*
*/

function filterDependencyDataset(dataset, threshold){
    const links = dataset.links;
    const filteredLinks = [];

    links.forEach(link => {
        if(link.sourceColor >= threshold || link.targetColor >= threshold){
            filteredLinks.push(link);
        }
    });

    dataset.links = filteredLinks;
    return dataset;
}




/*
* Generate list of all modules and create module indices for the files
* Also adds nodes for the used modules to the provided nodes list
* Additionally adds "name" attribute to files which is without the leading path
*/

export function assignModuleIndicesToFiles(nodes, allModules){
    const fileSet = nodes;
    let fileToModuleLinks = new Array();
    let usedModules = new Array();

    for (const file of fileSet) {
        for (const module of allModules) {
            const filesInModule = module.files.data;
            const found = filesInModule.findIndex(_ => _.path === file.id);

            // file is part of module
            if(found != -1) {
                let moduleIndex = nodes.findIndex(_ => _.id === module.path);

                if(moduleIndex === -1){
                    nodes.push({id: module.path, name: module.path, type: "m"});
                    usedModules.push(module);      
                    moduleIndex = nodes.length - 1;
                }

                const link = {
                    source: fileSet.findIndex(_ => _.id === file.id),
                    target: moduleIndex,
                }

                file.name = file.id.replace(module.path.substring(2) + "/", "");

                fileToModuleLinks.push(link);
                break;
            }
        }
    }

    const moduleToModuleLinks = internalCreateSubModuleLinks(usedModules, nodes);

    return {fileToModuleLinks, moduleToModuleLinks};
}


/*
* Function to create links between submodules and modules
*/

export function createSubModuleLinks(moduleData, nodes){
    const modules = moduleData;
    console.log("modules");
    console.log(modules);

    let usedModules = new Array();

    moduleData.forEach(module => {
        const isInUse = nodes.findIndex(_ => _.id === module.path)
        if (isInUse != -1) {
            usedModules.push(module);
        }
    });

    return internalCreateSubModuleLinks(usedModules, nodes);
}



function internalCreateSubModuleLinks(usedModules, nodes){
    let moduleLinks = new Array();

    for (const module of usedModules) {
        const subModules = module.subModules.data;
        const moduleIndex = nodes.findIndex(_ => _.id === module.path);

        for (const subModule of subModules) {
            const subModuleIndex = nodes.findIndex(_ => _.id === subModule.path);

            if(subModuleIndex != -1) {
                const link = {
                    source: moduleIndex,
                    target: subModuleIndex,
                }
                moduleLinks.push(link);
            }
        }
    }

    return moduleLinks;
}
