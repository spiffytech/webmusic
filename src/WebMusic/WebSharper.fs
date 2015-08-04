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
    open System.Web

    type Action =
    | Index

    let IndexContent (ctx : Context<Action>) =
        Content.Page(
            Title = "blah",
            Body = [Tags.Audio [Attr.Controls ""; Attr.Style "width: 100%;"] -< [
                Tags.Source [Attr.Src "https://archive.org/download/bfft2011-07-24.csb.royboy.115786.t-flac16/bela2011-07-24t03_Sex_In_A_Pan.ogg"; Attr.Type "audio/ogg; codecs=vorbis"];
                Tags.Source [Attr.Src "https://archive.org/download/bfft2011-07-24.csb.royboy.115786.t-flac16/bela2011-07-24t03_Sex_In_A_Pan.mp3"; Attr.Type "audio/mp3"];
            ]]
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
