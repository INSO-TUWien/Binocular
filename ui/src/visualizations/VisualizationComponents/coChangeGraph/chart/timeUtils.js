export function getFirstAndLastCommitDates(props){
    const commitsFiles = props.commitsFiles;
    let fileDates = new Map();
    let absoluteFirstCommit;
    let absoluteLastCommit;



    for (const commit of commitsFiles) {
        const files = commit.files.data;

        for (const fileHolder of files) {
            const file = fileHolder.file.path;

            if(absoluteFirstCommit === undefined) absoluteFirstCommit = commit.date;
            if(absoluteLastCommit === undefined) absoluteLastCommit = commit.date;

            if(commit.date < absoluteFirstCommit) absoluteFirstCommit = commit.date;
            if(commit.date > absoluteLastCommit) absoluteLastCommit = commit.date;

            // update dates for file
            if(fileDates.has(file)){
                let firstDate = fileDates.get(file).firstDate;
                let lastDate = fileDates.get(file).lastDate;

                if(commit.date < firstDate) firstDate = commit.date;
                if(commit.date > lastDate) lastDate = commit.date;

                fileDates.set(file, {firstDate: firstDate, lastDate: lastDate})
            } else {
                fileDates.set(file, {firstDate: commit.date, lastDate: commit.date})
            }
        }
    }

    return {absoluteFirstCommit, absoluteLastCommit, fileDates};
}