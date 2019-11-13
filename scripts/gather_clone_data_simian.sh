NOW=$(date +"%Y-%m-%d_%H-%M-%S")
DIRECTORY=$1
PROJECT_NAME=$2
CLONEDETECTOR=$3
LASTREV=$4
REVS=${DIRECTORY}/../${PROJECT_NAME}revs_$NOW.txt

echo $DIRECTORY
echo $PROJECT_NAME
echo $REVS
echo $LASTREV

cd $DIRECTORY/../$PROJECT_NAME

echo Getting Revisions
git rev-list HEAD --reverse > $REVS

# remove already indexed revisions from clone detection
sed  -i "1,/^${LASTREV}$/d" $REVS

CLONEDIR=$DIRECTORY/../${PROJECT_NAME}_Clones_$NOW
mkdir $CLONEDIR

echo Starting clone detection
cat $REVS | while read line
do
    echo Current revision: $line
    # git checkout $line

    echo Detecting type 1 clones
    # $CLONEDETECTOR . -threshold=4 -language=java -includes=**/*.java -formatter=xml -reportDuplicateText > $CLONEDIR/simian_%%A_type1.xml

    echo Detecting type 2 clones
    # $CLONEDETECTOR . -threshold=4 -language=java -includes=**/*.java -formatter=xml -reportDuplicateText -ignoreIdentifiers -ignoreLiterals -ignoreVariableNames > $CLONEDIR/simian_%%A_type2.xml

    break;
done
echo Finished clone detection

sleep 30s