namespace WebMusic.Web

module Templates =
    open WebMusic
    open Nustache.Core
    open System.IO
    let private tpldir = "templates"

    let render template data =
        let tpl = Path.Combine (tpldir, template)
        Render.FileToString(tpl, data)

module Server2 =
    open Suave
    open Suave.Http
    open Suave.Http.Applicatives
    open Suave.Http.Successful
    open Suave.Http.Files
    open Suave.Web
    open Suave.Sockets

    open WebMusic

    open System.Net

    let serve () =
        //startWebServer {defaultConfig with bindings = [{HttpBinding.scheme=Protocol.HTTP, ip="0.0.0.0", port=9000}]} (OK "Hello, World!")
        let app =
            let testdata = [("page_script", Client2.gen())] |> Map.ofList
            choose
                [ GET >>= choose
                    [ path "/" >>= OK @@ Templates.render "index.mustache" testdata;
                    pathScan "/static/%s" (fun (filename) -> file (sprintf "./static/%s" filename)) ]
                ]

        startWebServer {defaultConfig with bindings =
            [
                {defaultConfig.bindings.[0] with socketBinding =
                    {
                        SocketBinding.ip=(IPAddress.Parse "0.0.0.0")
                        port=uint16 9000
                    }
                }
            ]} app

