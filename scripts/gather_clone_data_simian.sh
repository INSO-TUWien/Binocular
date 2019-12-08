#!/bin/bash
NOW=$(date +"%Y-%m-%d_%H-%M-%S")
DIRECTORY=$1
PROJECT_NAME=$2
CLONEDETECTOR=$3
CLONEDIR=$4
REVS=$5
LASTREV=$6
#REVS=${DIRECTORY}/../${PROJECT_NAME}revs_$NOW.txt
#REVS=${DIRECTORY}/../${PROJECT_NAME}_revs.txt

echo $DIRECTORY
echo $PROJECT_NAME
echo $CLONEDETECTOR
echo $CLONEDIR
echo $REVS
echo $LASTREV

cd $DIRECTORY/../$PROJECT_NAME

# create clonedir if not exists
mkdir -p $CLONEDIR

echo Getting Revisions
git rev-list HEAD --reverse > $REVS

# remove already indexed revisions from clone detection
if [[ "${LASTREV}" != "UNDEFINED" ]];
then
    echo Removing already indexed Revisions
    sed  -i "0,/^${LASTREV}$/d" ${REVS}
fi

echo Starting clone detection
cat $REVS | while read line
do
    echo Current revision: $line
    git checkout $line

    echo Detecting type 1 clones
    java -jar ${CLONEDETECTOR} . -threshold=4 -language=java -includes=**/*.java -formatter=xml -reportDuplicateText > $CLONEDIR/simian_${line}_type1.xml    

    echo Detecting type 2 clones
    java -jar ${CLONEDETECTOR} . -threshold=4 -language=java -includes=**/*.java -formatter=xml -reportDuplicateText -ignoreIdentifiers -ignoreLiterals -ignoreVariableNames > $CLONEDIR/simian_${line}_type2.xml

    break;
done

cd $CLONEDIR
# remove all files that contain no clones
grep -rL '<block sourceFile' *.xml | xargs rm -f

# remove first 3 lines of Simian report as it is just license info
sed -i '1,3d' *.xml

echo Finished clone detection

sleep 1s