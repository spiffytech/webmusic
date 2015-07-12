module WebMusic.Tests

open WebMusic
open WebMusic.Core
open NUnit.Framework
open FsCheck
//open FsCheck.NUnit

[<Test>]
let ``Returns best supported codec`` () =
  let gen = Gen.nonEmptyListOf Arb.generate |> Arb.fromGen
  let prop = fun (supportedFormats:SupportedFormats) ->
      let bestFormat = supportedFormats |> selectBestFormat

      supportedFormats
      |> List.forall @@ fun format -> bestFormat <= format
  Check.QuickThrowOnFailure @@ Prop.forAll gen prop
  //let result = Library.hello i
  //result > 41 && result < 42
