namespace WebMusic.Web

open WebSharper

module Rpc =
    open WebSharper

    [<Rpc>]
    let tracks () =
        ()
(*

[<JavaScript>]
module Client =
    open WebSharper.UI.Next
    open WebSharper.UI.Next.Html
    open WebSharper.UI.Next.Client
    //open WebSharper.JavaScript

    let blah = div [text "stuff1"]

    let library collection =
        let rvCollection = Var.Create collection
        let vCollection =
            rvCollection.View
            |> View.Map (fun collection ->
                div [text collection])
        Doc.EmbedView vCollection

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
    open Client

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

    let IndexContent (_ (*ctx*) : Context<Action>) =
        (*
        Content.Page(
            Title = "blah",
            //Body = Doc.AsElements @@ div (testTracks |> List.map activeTrackWidget)
            Body = Doc.AsElements @@ div (testTracks.[0] |> activeTrackWidget)
        )
        *)
        let blah = testTracks |> List.map activeTrackWidget
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
            div [
                client <@ Client.blah @>
                client <@ Client.library "blah" @>
                div (blah |> Seq.take 3 |> Seq.map @@ fun e -> e :> Doc)
            ]
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
*)

open WebSharper
open WebSharper.UI.Next
open WebSharper.UI.Next.Html
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
          h1 [text "Enter text below"]
          client <@ Client.Widget() @>
          buttonAttr [on.click <@ Client.Alert @>] [text "Click me!"]
        ]
      )
