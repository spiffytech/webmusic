namespace WebMusic.Web

open WebSharper

module Rpc =
    open WebSharper

    [<Rpc>]
    let tracks () =
        ()

[<JavaScript>]
module Client =
    open WebSharper.UI.Next
    open WebSharper.UI.Next.Html
    open WebSharper.UI.Next.Client
    open WebSharper.JavaScript

    let (@~) fn x = fn x

    open WebMusic

    let activeTrackWidget track httpref =
        div [
            div [text @~ sprintf "%s (%s) / %s" track.title track.artist.name track.album.name]
            audioAttr [attr.controls ""; attr.style "width: 100%;"] [
                sourceAttr [attr.src httpref; (*Attr.Type "audio/mp3"*)] [];
            ]
        ]

    let rvCurrentTrack = Var.Create None
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

    let library tracks =
        //JS.Alert("blah")
        //div [text @~ sprintf "%A" tracks]
        let rvFilter = Var.Create ""

        let rvCollection = Var.Create tracks
        let vCollection =
            (rvCollection.View, rvFilter.View)
            ||> View.Map2 @~ fun tracks filterStr ->
                let filtered =
                    match filterStr with
                    | "" -> tracks
                    | str ->
                        tracks
                        |> Seq.filter @~ fun (track, _) ->
                            track.title.Contains(str) || track.album.name.Contains(str) || track.artist.name.Contains(str)

                filtered
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
        let streamreader = new System.IO.StreamReader("tracks.json")
        let rows = JsonConvert.DeserializeObject<List<System.Collections.Generic.Dictionary<string,string>>>(streamreader.ReadToEnd())
        rows
        |> List.map mkTrack

    let httprefFromHostedFile hf =
        match hf.src with
        | HTTP src -> new Uri(src, hf.filename) |> string

    let IndexContent (_ (*ctx*) : Context<Action>) =
        (*
        Content.Page(
            Title = "blah",
            //Body = Doc.AsElements @@ div (testTracks |> List.map activeTrackWidget)
            Body = Doc.AsElements @@ div (testTracks.[0] |> activeTrackWidget)
        )
        *)
        let tracks =
            testTracks
            |> List.map @@ fun (hf, track) -> (track, httprefFromHostedFile hf)
            |> Seq.take 3
        (*
        let blah2 = [testTracks.[0] |> activeTrackWidget; testTracks.[1] |> activeTrackWidget; ]
        let blah2 = [testTracks.[0] |> activeTrackWidget] |> Seq.ofList
        Content.Doc(
            //div (testTracks |> List.map activeTrackWidget)
            div [testTracks.[0] |> activeTrackWidget]
        )
        *)
        Content.Doc(
            //div (blah2 |> Seq.map @@ fun e -> e :> Doc)
            printfn "%A" tracks
            let t =
                List.ofSeq tracks
                |> Seq.ofList
            //let t = [0..3] |> Seq.ofList
            //let t = tracks
            div [
                client <@ Client.playerWidget () @>
                client <@ Client.library t @>
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
