#!/bin/bash
export PATH="$HOME/.local/bin:$PATH"

OUTPUT="dist/output.pdf"
BIB="docs/references.bib"
CSL="docs/styles/abnt.csl"

FILES=$(sed 's/^/docs\//' docs/structure.txt)

pandoc docs/metadata.yaml $FILES \
  --filter pandoc-plantuml \
  --bibliography=$BIB \
  --citeproc \
  --csl=$CSL \
  --lua-filter=scripts/filter-bib.lua \
  --highlight-style=tango \
  --pdf-engine=xelatex \
  -V mainfont="Times New Roman" \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  -V geometry:top=2.5cm,bottom=2.5cm,right=2.5cm,left=3.5cm,headsep=1.5cm,headheight=15pt \
  -o $OUTPUT

echo "Document successfully generated in $OUTPUT"