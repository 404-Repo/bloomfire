#!/bin/zsh
cd ~/astrocade-game5/work/artref_scratch
for k in "$@"; do
  p=$(python3 -c "import obj_prompts as c; print(c.P['$k'])")
  python3 ~/astrocade-game5/tools/atlas_img.py fast ~/astrocade-game5/ref/objects/$k.png "artref object $k" "$p" > olog_$k.txt 2>&1 &
done
wait
for k in "$@"; do cut -c1-60 olog_$k.txt; grep -o '"ok": [a-z]*' olog_$k.txt; done
