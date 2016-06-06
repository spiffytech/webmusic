#!/bin/env python

from csv import DictReader
import json
import os
from pprint import pprint

rows = os.popen("cd ~/Music && beet ls -f '$artist	$album	$title	$path'").read().split("\n")
reader = DictReader(rows, fieldnames=["artist", "album", "title", "path"], delimiter="	")
d = []
for row in reader:
    row["path"] = os.path.relpath(row["path"], os.path.join(os.path.expanduser("~"), "Music"))
    d.append(row)
json.dump(d, open("/tmp/tracks.json", "w"), indent=4)
