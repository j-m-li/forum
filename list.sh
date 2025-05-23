#!/bin/bash

# This script replaces all occurrences of "localStorage" with "sessionStorage"
# in each file provided as a command-line argument.

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 file1 [file2 ... fileN]"
  exit 1
fi

for file in "$@"; do
  if [ -f "$file" ]; then
    echo -n "$file, "
  else
    echo "File not found: $file"
  fi
done

