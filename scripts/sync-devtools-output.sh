#!/bin/bash

a_path="packages/devtools-frontend-lynx/output"
b_path="packages/lynx-devtool-cli/resources"

latest_file=$(find "$a_path" -type f -name "devtool.frontend.lynx_1.0.*.tar.gz" | sort -V | tail -n 1)

if [[ -z "$latest_file" ]]; then
  echo "Error: devtool.frontend.lynx not found."
  exit 1
fi

echo "The latest devtool.frontend.lynx dist: $latest_file"

echo "Deleting old dist..."
find "$b_path" -type f -name "devtool.frontend.lynx_1.0.*.tar.gz" -exec rm -v {} \;

echo "cp the latest dist..."
cp -v "$latest_file" "$b_path/"

echo "Sync devtools output successfully!"
