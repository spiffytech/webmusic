namespace WebMusic

module Core =
    open DomainTypes

    open Newtonsoft.Json

    let selectBestFormat supportedFormats =
        supportedFormats
        |> List.sort
        |> List.head

    let needsConversion fileType supportedFormats =
        supportedFormats
        |> List.tryFind ((=) fileType)
        |> function
          | Some _ -> false
          | None -> true

    let tracksToManifest (tracks : Track list) =
        JsonConvert.SerializeObject tracks

    let manifestToTracks manifest =
        JsonConvert.DeserializeObject<Track list> manifest
