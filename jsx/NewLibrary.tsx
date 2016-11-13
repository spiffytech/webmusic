// import * as React from "react";
import * as latinize from "latinize";
// import {Glyphicon, Button} from "react-bootstrap";
import {
    action,
    computed,
    observable
} from "mobx";
// import {observer} from "mobx-react";

type Breadcrumb = [(track: ITrack) => string, string | null];

export class LibraryManager {
    public filter = observable<string | null>(null);

    public tracks = observable<ITrack>([]);

    public available_views = observable([
        (track: ITrack) => track.title,
        (track: ITrack) => track.album,
        (track: ITrack) => track.artist
    ]);

    public breadcrumbs = observable<Breadcrumb>([[this.available_views.pop(), null]]);

    @action
    public select(selected: string) {
        this.breadcrumbs[this.breadcrumbs.length - 1][1] = selected;
        this.breadcrumbs.push([this.available_views.pop(), null]);
    }

    @action
    public go_back() {
        if (this.breadcrumbs.length === 1) return;

        const current_view = this.breadcrumbs.pop();
        this.available_views.push(current_view[0]);
    }

    public can_select = computed(() => this.available_views.length > 0);

    public visible_tracks = computed(() => {
        const selected = this.breadcrumbs.filter(breadcrumb => breadcrumb[1] !== null);

        return this.tracks.filter(track =>
            selected.every(([getter, match_str]) => getter(track) === match_str)
        );
    });

    public selector_options = computed(() => {
        const [getter] = this.breadcrumbs.find(breadcrumb => breadcrumb[1] === null);
        return Array.from(new Set(this.visible_tracks.get().map(getter))).map(latinize);
    });
}
