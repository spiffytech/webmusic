#!/bin/bash

docker run --rm -i -t -v $(pwd):/source $DOCKEROPTS -e "MONO_OPTIONS=$MONO_OPTIONS" spiffytech/fsharp-mono-xsp $@
