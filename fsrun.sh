#!/bin/bash

docker run --rm -i -t -v $(pwd):/source $DOCKEROPTS spiffytech/fsharp-mono-xsp $@
