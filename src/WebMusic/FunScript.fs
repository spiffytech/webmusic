namespace WebMusic.Web

open FunScript
open FunScript.TypeScript
[<FunScript.JS>]
module Client2 =
    open System.IO

    let main () = Globals.window.alert("Hello, world!")

    let gen () =
        let dir = __SOURCE_DIRECTORY__
        let code = FunScript.Compiler.Compiler.Compile(<@ main () @>, noReturn=true)
        //File.WriteAllText(Path.Combine(dir, "../app.js"), code)
        code
