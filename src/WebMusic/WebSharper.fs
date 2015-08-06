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
    open WebSharper.UI.Next
    open WebSharper.UI.Next.Html
    open WebSharper.UI.Next.Server
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
        div [
            div [text @@ sprintf "%s (%s) / %s" track.title track.artist.name track.album.name]
            audioAttr [attr.controls ""; attr.style "width: 100%;"] [
                sourceAttr [attr.src (httpref |> httprefFromHostedFile); (*Attr.Type "audio/mp3"*)] [];
            ]
        ]

    let IndexContent (ctx : Context<Action>) =
        (*
        Content.Page(
            Title = "blah",
            //Body = Doc.AsElements @@ div (testTracks |> List.map activeTrackWidget)
            Body = Doc.AsElements @@ div (testTracks.[0] |> activeTrackWidget)
        )
        *)
        let blah = testTracks |> List.map activeTrackWidget
        //let blah2 = [testTracks.[0] |> activeTrackWidget; testTracks.[1] |> activeTrackWidget; ]
        let blah2 = [testTracks.[0] |> activeTrackWidget] |> Seq.ofList
        Content.Doc(
            //div (testTracks |> List.map activeTrackWidget)
            div [testTracks.[0] |> activeTrackWidget]
        )
        Content.Doc(
            //div (blah2 |> Seq.map @@ fun e -> e :> Doc)
            div (blah |> Seq.map @@ fun e -> e :> Doc)
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
