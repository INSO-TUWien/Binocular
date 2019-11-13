NOW=$(date +"%Y-%m-%d_%H-%M-%S")
DIRECTORY=$1
PROJECT_NAME=$2
CLONEDETECTOR=$3
REVS=${DIRECTORY}/../${PROJECT_NAME}revs_$NOW.txt

echo $DIRECTORY
echo $PROJECT_NAME
echo $REVS

cd $DIRECTORY/../$PROJECT_NAME

echo Getting Revisions
git rev-list HEAD --reverse > $REVS

CLONEDIR=$DIRECTORY/../${PROJECT_NAME}_Clones_$NOW
mkdir $CLONEDIR

echo Starting clone detection
cat $REVS | while read line
do
    echo Current revision: $line
    git checkout $line

    echo Detecting type 1 clones
    $DIRECTORY/../$CLONEDETECTOR --minimum-tokens 10 --format xml --skip-lexical-errors --skip-duplicate-files --files . \
    | awk '
  BEGIN{x=""}
  {print}
  /<\/codefragment>/{
    x=x $0;
    cmd="md5sum";
    print x |& cmd;
    close(cmd,"to");
    cmd |& getline m;
    close(cmd);
    sub(" .*","",m);
    print "<fingerprint>"m"</fingerprint>";
    x="";
    next;
  }
  /<codefragment>/{
    x=$0 RS;
    next;
  }
  {
    if(x!="") x=x $0 RS;
  }
' > $CLONEDIR/cpd_type1_$line.xml

    echo Detecting type 2 clones
    $DIRECTORY/../$CLONEDETECTOR --minimum-tokens 10 --format xml --skip-lexical-errors --skip-duplicate-files --ignore-literals --ignore-identifiers --files . \
    | awk '
  BEGIN{x=""}
  {print}
  /<\/codefragment>/{
    x=x $0;
    cmd="md5sum";
    print x |& cmd;
    close(cmd,"to");
    cmd |& getline m;
    close(cmd);
    sub(" .*","",m);
    print "<fingerprint>"m"</fingerprint>";
    x="";
    next;
  }
  /<codefragment>/{
    x=$0 RS;
    next;
  }
  {
    if(x!="") x=x $0 RS;
  }
' > $CLONEDIR/cpd_type2_$line.xml

done
echo Finished clone detection

sleep 30s