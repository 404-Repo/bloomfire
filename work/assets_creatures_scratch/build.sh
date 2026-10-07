#!/bin/bash
# assemble src/<obj>/cN.js (with //MATS and //PLACE markers) into receipts/candidates/<obj>/cN.js
S=~/astrocade-game5/work/assets_creatures_scratch
C=~/astrocade-game5/receipts/candidates
for f in $S/src/$1/*.js; do
  n=$(basename $f)
  awk -v mats="$S/mats.txt" -v rmats="$S/src/rifle_mats.txt" -v place="$S/place.txt" '
    /\/\/RMATS/ { while ((getline l < rmats) > 0) print l; close(rmats); next }
    /\/\/MATS/ { while ((getline l < mats) > 0) print l; close(mats); next }
    /\/\/PLACE/ { while ((getline l < place) > 0) print l; close(place); next }
    { print }' $f > $C/$1/$n
done
for f in $S/src/$1/*.expect.json; do cp $f $C/$1/; done 2>/dev/null
ls $C/$1
