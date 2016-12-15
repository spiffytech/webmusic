// import * as React from "react";
import * as _ from "lodash";
import * as latinize from "latinize";
// import {Glyphicon, Button} from "react-bootstrap";
import {
    action,
    computed,
    observable
} from "mobx";
// import {observer} from "mobx-react";

type View = (track: ITrack) => string;

export class LibraryManager {
    public filter = observable<string | null>(null);

    public tracks = observable<ITrack>([]);

    public available_views: View[] = [
        (track: ITrack) => track.artist,
        (track: ITrack) => track.album,
        (track: ITrack) => track.title
    ];

    public breadcrumbs = observable<string>([]);

    @action
    public select(selected: string) {
        this.breadcrumbs.push(selected);
    }

    @action
    public go_back() {
        this.breadcrumbs.pop();
    }

    public can_select = computed(() => this.available_views.length === this.breadcrumbs.length);

    public visible_tracks = computed(() => {
        const selected: [View, string][] = (_.zip<any>(
            this.available_views,
            this.breadcrumbs.slice()
        ) as [View, string][]).
        filter(([, breadcrumb]) => breadcrumb !== null);

        return this.tracks.filter(track =>
            selected.every(([getter, match_str]) => getter(track) === match_str)
        );
    });

    public selector_options = computed(() => {
        const [getter] = (_.zip<any>(
            this.available_views,
            this.breadcrumbs
        ) as [View, string][]).
        find(([, breadcrumb]) => breadcrumb === null);

        const options = new Set(this.visible_tracks.get().map(getter));
        return Array.from(options).map(latinize);
    });
}
