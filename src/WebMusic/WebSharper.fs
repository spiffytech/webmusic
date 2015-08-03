namespace WebMusic.Web


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
            Body = [Tags.Audio [Attr.Src "https://archive.org/download/bfft2011-07-24.csb.royboy.115786.t-flac16/bela2011-07-24t03_Sex_In_A_Pan.mp3"; Attr.Controls ""]]
        )

    [<Website>]
    let MyWebsite =
        Sitelet.Sum [
            Sitelet.Content "/" Index IndexContent
        ]
//    type MySampleWebsite() =
//      interface IWebsite<Action> with
//        member this.Sitelet =
//          Sitelet.Sum [
//              Sitelet.Content "/" Index IndexContent
//          ]
//
//        member this.Actions = []
//
//    type Global() =
//        inherit System.Web.HttpApplication()
//        member g.Application_Start(sender: obj, args: System.EventArgs) =
//            ()
//
//[<assembly: Website(typeof<Server.MySampleWebsite>)>]
//do ()
