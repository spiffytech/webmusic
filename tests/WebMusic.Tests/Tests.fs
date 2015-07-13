module WebMusic.Tests

open WebMusic
open WebMusic.Core
open NUnit.Framework
open FsCheck
//open FsCheck.NUnit
open Newtonsoft.Json

[<Test>]
let ``Returns best supported codec`` () =
  let gen = Gen.nonEmptyListOf Arb.generate |> Arb.fromGen
  let prop = fun (supportedFormats:SupportedFormats) ->
      let bestFormat = selectBestFormat supportedFormats

      supportedFormats
      |> List.forall @@ fun format -> bestFormat <= format
  Check.QuickThrowOnFailure @@ Prop.forAll gen prop

[<Test>]
let ``Filetype never needs conversion if it's in the supported format list`` () =
  let gen = Gen.nonEmptyListOf Arb.generate |> Arb.fromGen
  let fileType = WAV
  let prop = fun (supportedFormats:SupportedFormats) ->
    fileType :: supportedFormats
    |> needsConversion fileType
    |> (=) false

  Check.QuickThrowOnFailure @@ Prop.forAll gen prop

[<Test>]
let ``Filetype always needs conversion if it's not in the supported format list`` () =
  let gen = Gen.nonEmptyListOf Arb.generate |> Arb.fromGen
  let fileType = WAV
  let prop = fun (supportedFormats:SupportedFormats) ->
    supportedFormats |> List.filter @@ fun t -> t <> fileType
    |> needsConversion fileType
    |> (=) true

  Check.QuickThrowOnFailure @@ Prop.forAll gen prop

[<Test>]
let ``track to manifest produces valid JSON`` () =
  let prop tracks =
    let json = tracksToManifest tracks
    let _ = JsonConvert.DeserializeObject<Track list> json
    true

  Check.QuickThrowOnFailure prop

[<Test>]
let ``Manifest gets converted into tracks`` () =
  let prop tracks =
    let json = tracksToManifest tracks
    let _ = manifestToTracks json
    true

  Check.QuickThrowOnFailure prop

[<Test>]
let ``Tracks -> manifest -> tracks works`` () =
  let prop tracks =
    let json = tracksToManifest tracks
    let tracks' = manifestToTracks json
    tracks = tracks'

  Check.QuickThrowOnFailure prop

[<Test>]
let ``Manifest -> tracks -> manifest works`` () =
  let prop tracks =
    let json = tracksToManifest tracks
    let tracks' = manifestToTracks json
    let json' = tracksToManifest tracks
    json = json'

  Check.QuickThrowOnFailure prop
