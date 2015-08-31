namespace WebMusic.Web

module Server2 =
    open Suave
    open Suave.Http
    open Suave.Http.Applicatives
    open Suave.Http.Successful
    open Suave.Http.Files
    open Suave.Web
    open Suave.Sockets
    open System.Net

    let serve () =
        //startWebServer {defaultConfig with bindings = [{HttpBinding.scheme=Protocol.HTTP, ip="0.0.0.0", port=9000}]} (OK "Hello, World!")
        let app =
            choose
                [ GET >>= choose
                    [ path "/" >>= OK "Index!";
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

