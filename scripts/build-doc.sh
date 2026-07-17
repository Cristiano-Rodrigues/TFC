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
  -o $OUTPUT

echo "Document successfully generated in $OUTPUT"