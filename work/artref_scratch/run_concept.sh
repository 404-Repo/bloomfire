#!/bin/zsh
cd ~/astrocade-game5/work/artref_scratch
for k in "$@"; do
  p=$(python3 -c "import concept_prompts as c; print(c.P['$k'])")
  python3 ~/astrocade-game5/tools/atlas_img.py std ~/astrocade-game5/ref/concept/$k.png "artref concept $k" "$p" > log_$k.txt 2>&1 &
done
wait
cat log_*.txt
