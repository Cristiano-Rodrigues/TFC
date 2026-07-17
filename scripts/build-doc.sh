#!/bin/bash

OUTPUT="dist/output.pdf"
BIB="docs/references.bib"
CSL="docs/styles/apa.csl"

FILES=$(sed 's/^/docs\//' docs/structure.txt)

pandoc docs/metadata.yaml $FILES \
  --filter mermaid-filter \
  --bibliography=$BIB \
  --citeproc \
  --csl=$CSL \
  --pdf-engine=xelatex \
  -V mainfont="Times New Roman" \
  -V fontsize=12pt \
  -V linestretch=1.5 \
  -V geometry:"top=2.5cm, bottom=2.5cm, right=2.5cm, left=3.5cm" \
  -o $OUTPUT

echo "Document successfully generated in $OUTPUT"