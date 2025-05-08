#!/bin/bash

grep error *.php | grep json_encode | awk -F '=>' '{ print $3 }' | awk -F ']' '{ print $1 }' | \
while read f; do
    echo "${f}:${f},"
done

