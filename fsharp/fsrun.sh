#!/bin/bash

[ -z $CONTAINER ] && CONTAINER=spiffytech/fsharp-mono-xsp

docker run --rm -i -t -v $(pwd):/source $DOCKEROPTS -e "MONO_OPTIONS=$MONO_OPTIONS" $CONTAINER $@
