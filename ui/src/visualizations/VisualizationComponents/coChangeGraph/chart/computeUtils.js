export default function computeDependencies(props){
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

    let dependencies = [];

    // compute the dependencies
    for (const srcFile of fileSet) {

        if(sharedCommitCnt[srcFile] === undefined) continue;

        // iterate over all keys of sharedCommitCnt[srcFile]
        // and compute both sides of the dependency
        Object.keys(sharedCommitCnt[srcFile]).forEach(function(dstFile) {
            const srcCoChange = sharedCommitCnt[srcFile][dstFile] / commitCntPerFile[srcFile]   //cochange percentage from source POV
            const dstCoChange = sharedCommitCnt[srcFile][dstFile] / commitCntPerFile[dstFile]    //cochange percentage from destination POV 

            const link = {
                src: srcFile,
                dst: dstFile,
                srcDependency: srcCoChange,
                dstDependency: dstCoChange
            }
            
            const key = srcFile + ":" + dstFile;
            const reverseKey = dstFile + ":" + srcFile;

            // check both directions to avoid duplicates
            if (dependencies[key] === undefined && dependencies[reverseKey] === undefined) {
                dependencies[key] = link;
            }
        });
    }

    let dependencyArray = [];

    // convert to array for ease of use
    Object.keys(dependencies).forEach(function(key) {
        dependencyArray.push(dependencies[key]);
    });

    console.log(dependencyArray);
    console.log(fileSet);
}


function validateSharedCommitCnt(sharedCommitCnt, srcFile, dstFile) {
    if(sharedCommitCnt[srcFile] === undefined){
        sharedCommitCnt[srcFile] = [];
    }

    if(sharedCommitCnt[srcFile][dstFile] === undefined){
        sharedCommitCnt[srcFile][dstFile] = 0;
    }
}