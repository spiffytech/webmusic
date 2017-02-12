#!/bin/env python

from csv import DictReader
import json
import os
from pprint import pprint

formats_map = {
    "AAC": "aac",
    "OGG": "ogg",
    "MP3": "mp3",
    "FLAC": "flac",
    "Windows Media": "wma",
    "ALAC": "alac"
}

rows = os.popen("cd ~/Music && beet ls -f '$artist	$album	$title	$track	$length	$format	$path'").read().split("\n")
reader = DictReader(rows, fieldnames=["artist", "album", "title", "track_num", "length", "format", "path"], delimiter="	")
d = []
for row in reader:
    row["formats"] = [{
        "format": formats_map[row["format"]],
        "url": os.path.relpath(row["path"], os.path.join(os.path.expanduser("~"), "Music"))
    }]

    row.pop("format", None)
    row.pop("path", None)

    row["track_num"] = int(row["track_num"])
    row["length"] = float(row["length"])

    d.append(row)
json.dump(d, open("/tmp/tracks.json", "w"), indent=4)
