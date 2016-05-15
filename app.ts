// This is for using WebPack loaders. Only works with non-global require()
// (i.e., called from inside a function)
// <reference path="typings/require.d.ts" />

import * as React from "react";
import { render } from "react-dom";

//import * as dom from "./jsx/index.tsx";
import {dom} from "./jsx/index.tsx";

window.fetch("/tracks.json").
then(response => response.json()).
then(t => console.log(t));

render(
    dom,
    document.getElementById("react-target")
);
