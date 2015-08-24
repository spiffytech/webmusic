namespace WebMusic.Web

open WebSharper

module Rpc =
    open System

    open WebSharper
    open Newtonsoft.Json

    open WebMusic

    [<Rpc>]
    let tracks () =
        ()

    let httprefFromHostedFile hf =
        match hf.src with
        | HTTP src -> new Uri(src, hf.filename) |> string

    [<Rpc>]
    let getLibrary () =
        async {
            let mkTrack (dict:System.Collections.Generic.Dictionary<string,string>) =
                let httpref = {HostedFile.src = HTTP (new Uri("http://localhost:8000")); filename = dict.["path"]}
                let track = {
                    title = dict.["title"]
                    artist = {Artist.name = dict.["artist"]}
                    album = {Album.name = dict.["album"]}
                }
                (httpref, track)

            let testTracks =
                let streamreader = new System.IO.StreamReader("tracks.json")
                let rows = JsonConvert.DeserializeObject<List<System.Collections.Generic.Dictionary<string,string>>>(streamreader.ReadToEnd())
                rows
                |> List.map mkTrack

            let withRefs =
                testTracks
                |> List.map @@ fun (hf, track) -> (track, httprefFromHostedFile hf)
                |> Seq.take 2000
                |> List.ofSeq

            return withRefs
        }


[<JavaScript>]
module Client =
    open WebSharper.UI.Next
    open WebSharper.UI.Next.Html
    open WebSharper.UI.Next.Client
    open WebSharper.JavaScript

    let (@~) fn x = fn x

    open WebMusic

    let rvCollection = Var.Create []
    let rvCurrentTrack = Var.Create None
    let rvFilter = Var.Create ""
    let rvPlaylist = Var.Create []

    let vPlaylist =
        (rvCollection.View, rvFilter.View)
        ||> View.Map2 @~ fun tracks filterStr ->
            let filtered =
                match filterStr with
                | "" -> tracks
                | str ->
                    tracks
                    |> List.filter @~ fun (track, _) ->
                        track.title.Contains(str) || track.album.name.Contains(str) || track.artist.name.Contains(str)

            rvPlaylist.Value <- filtered
            filtered

    let playNextTrack trackWRef =
        // TODO: This assumes a track is only in the playlist once. FIX THIS.
        rvPlaylist.Value
        |> List.tryFindIndex @~ (=) trackWRef
        |> function
            | None ->  // Happens when the playlist is erased while the track is playing
                match rvPlaylist.Value with
                | x::_ -> rvCurrentTrack.Value <- Some x
                | [] -> rvCurrentTrack.Value <- None
            | Some i ->
                match (List.length rvPlaylist.Value) with
                | l when l <= i -> rvCurrentTrack.Value <- None
                | _ -> rvCurrentTrack.Value <- Some @~ List.nth rvPlaylist.Value (i+1)

    let activeTrackWidget track httpref =
        div [
            div [text @~ sprintf "%s (%s) / %s" track.title track.artist.name track.album.name]
            audioAttr [attr.controls ""; attr.style "width: 100%;"; attr.autoplay "true"; Attr.Handler "ended" @~ fun _ _ -> playNextTrack (track,httpref)] [
                sourceAttr [attr.src httpref; (*Attr.Type "audio/mp3"*)] [];
            ]
        ]

    let vCurrentTrack =
        rvCurrentTrack.View
        |> View.Map @~ function
          | None -> div []
          | Some (track, httpref) -> activeTrackWidget track httpref

    let trackListingWidget track httpref =
        divAttr [Attr.Handler "click" @~ fun _ _ -> rvCurrentTrack.Value <- Some (track, httpref)] [text @~ sprintf "%s (%s) / %s" track.title track.artist.name track.album.name]

    let playerWidget () =
        div [
            div [text "Current track"]
            Doc.EmbedView vCurrentTrack
        ]

    let fetchLibrary () =
        async {
            let! tracks = Rpc.getLibrary ()
            rvCollection.Value <- tracks
        }
        |> Async.Start
        div []


    let libraryWidget () =
        //JS.Alert("blah")
        //div [text @~ sprintf "%A" tracks]
        let vCollection =
            vPlaylist
            |> View.Map @~ fun tracks ->
                tracks
                |> Seq.map @~ fun (track, httpref) ->
                    trackListingWidget track httpref
                    |> fun x -> x :> Doc
                |> fun divs ->
                    div divs

        div [
            Doc.Input [] rvFilter
            Doc.EmbedView vCollection
        ]

module Server =
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

    let IndexContent (_ (*ctx*) : Context<Action>) =
        Content.Doc(
            div [
                client <@ Client.playerWidget () @>
                client <@ Client.libraryWidget () @>
                client <@ Client.fetchLibrary () @>
            ]
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]

(*
open WebSharper
open WebSharper.UI.Next
open WebSharper.UI.Next.Html
open WebSharper.Web
[<JavaScript>]
module Client =
  open WebSharper.JavaScript
  open WebSharper.UI.Next.Client
  
  let Widget() =
    let rvInput = Var.Create ""
    Doc.Concat [
      Doc.Input [] rvInput
      p [text "You typed: "; textView rvInput.View]
    ]
    
  let Alert el ev =
    JS.Alert "Clicked!"

module Server =
  open WebSharper.Sitelets
  open WebSharper.UI.Next.Server

  [<Website>]
  let MyWebsite =
    Application.SinglePage <| fun context ->
      Content.Doc(
        div [
          WebSharper.UI.Next.Doc.TextNode "<h3>blah!</h3>"
          h1 [text "Enter text below"]
          client <@ Client.Widget() @>
          buttonAttr [on.click <@ Client.Alert @>] [text "Click me!"]
        ]
      )
      *)
