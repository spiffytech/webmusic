namespace WebMusic.Web

module Server2 =
    open Suave
    open Suave.Http.Successful
    open Suave.Web
    open Suave.Sockets
    open System.Net

    let serve () =
        //startWebServer {defaultConfig with bindings = [{HttpBinding.scheme=Protocol.HTTP, ip="0.0.0.0", port=9000}]} (OK "Hello, World!")
        startWebServer {defaultConfig with bindings =
            [
                {defaultConfig.bindings.[0] with socketBinding =
                    {
                        SocketBinding.ip=(IPAddress.Parse "0.0.0.0")
                        port=uint16 9000
                    }
                }
            ]} (OK "Hello, World!")

