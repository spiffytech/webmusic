namespace WebMusic.Web

open FunScript
open FunScript.TypeScript
open FunScript.HTML
[<FunScript.JS>]
module Client2 =
    open System.IO

    let rec hold ractive =
        Globals.window.setTimeout((fun () -> hold ractive), 1000)

    let main () =
        let opts = createEmpty<RactiveNewOptions>()
        opts.el <- "#dynamic"
        opts.template <- "#template"
        opts.data <- ([("name", "spiffy")] |> dict)
        let ractive = Globals.Ractive.Create(opts)
        ()

    let gen () =
        let dir = __SOURCE_DIRECTORY__
        let code = FunScript.Compiler.Compiler.Compile(<@ main () @>, noReturn=true)
        //File.WriteAllText(Path.Combine(dir, "../app.js"), code)
        code
