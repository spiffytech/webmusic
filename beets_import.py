#!/bin/env python

from csv import DictReader
import os

rows = os.popen("cd ~/Music && beet ls -f '$artist	$album	$title	$path' | tail").read().split("\n")
reader = DictReader(rows, fieldnames=["artist", "album", "title", "path"], delimiter="	")
for row in reader:
    print row
