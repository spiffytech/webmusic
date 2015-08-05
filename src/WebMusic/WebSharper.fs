namespace WebMusic.Web

module Rpc =
    open WebSharper

    [<Rpc>]
    let tracks () =
        ()

module Server =
    open WebSharper
    open WebSharper.Sitelets
    open WebSharper.Html.Server
    open System
    open System.Web

    open WebMusic

    type Action =
    | Index

    let testTrack = {
            title = "Sex in a Pan"
            artist = {Artist.name = "Bela Fleck and the Flecktones"}
            album = {Album.name = "2011-07-04 - Some Concert"}
            //httpref = {HostedFile.src = HTTP (new Uri("https://archive.org")); filename = "download/bfft2011-07-24.csb.royboy.115786.t-flac16/bela2011-07-24t03_Sex_In_A_Pan.ogg"}
            httpref = {HostedFile.src = HTTP (new Uri("http://localhosT:8000")); filename = "http://localhost:8000/05%20Camminata%20Maldestra%20(Original%20Mix)%20(Clumsy%20Walking).mp3"}
        }

    let httprefFromHostedFile hf =
        match hf.src with
        | HTTP src -> new Uri(src, hf.filename) |> string

    let audioFromTrack track =
        Tags.Audio [Attr.Controls ""; Attr.Style "width: 100%;"] -< [
            Tags.Source [Attr.Src (track.httpref |> httprefFromHostedFile); (*Attr.Type "audio/mp3"*)];
        ]

    let IndexContent (ctx : Context<Action>) =
        Content.Page(
            Title = "blah",
            Body = [audioFromTrack testTrack]
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
