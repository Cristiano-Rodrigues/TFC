#!/bin/bash

OUTPUT="dist/output.pdf"
BIB="docs/references.bib"
CSL="docs/styles/apa.csl"

FILES=$(sed 's/^/docs\//' docs/structure.txt)

pandoc $FILES \
  --bibliography=$BIB \
  --citeproc \
  --csl=$CSL \
  -o $OUTPUT

echo "Document successfully generated in $OUTPUT"