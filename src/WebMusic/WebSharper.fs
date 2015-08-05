namespace WebMusic.Web

module Rpc =
    open WebSharper

    [<Rpc>]
    let tracks () =
        ()

module Server =
    open Newtonsoft.Json
    open WebSharper
    open WebSharper.Sitelets
    open WebSharper.Html.Server
    open System
    open System.Web

    open WebMusic

    type Action =
    | Index

    let mkTrack (dict:System.Collections.Generic.Dictionary<string,string>) =
        let httpref = {HostedFile.src = HTTP (new Uri("http://localhost:8000")); filename = dict.["path"]}
        let track = {
            title = dict.["title"]
            artist = {Artist.name = dict.["artist"]}
            album = {Album.name = dict.["album"]}
            //httpref = {HostedFile.src = HTTP (new Uri("https://archive.org")); filename = "download/bfft2011-07-24.csb.royboy.115786.t-flac16/bela2011-07-24t03_Sex_In_A_Pan.ogg"}
        }
        (httpref, track)

    let testTracks =
        let streamreader = new System.IO.StreamReader("/tmp/tracks.json")
        let rows = JsonConvert.DeserializeObject<List<System.Collections.Generic.Dictionary<string,string>>>(streamreader.ReadToEnd())
        rows
        |> List.map mkTrack

    let httprefFromHostedFile hf =
        match hf.src with
        | HTTP src -> new Uri(src, hf.filename) |> string

    let activeTrackWidget (httpref, track) =
        Div [
            Div [Text @@ sprintf "%s (%s) / %s" track.title track.artist.name track.album.name]
            Tags.Audio [Attr.Controls ""; Attr.Style "width: 100%;"] -< [
                Tags.Source [Attr.Src (httpref |> httprefFromHostedFile); (*Attr.Type "audio/mp3"*)];
            ]
        ]

    let IndexContent (ctx : Context<Action>) =
        Content.Page(
            Title = "blah",
            Body = (testTracks |> List.map activeTrackWidget)
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
