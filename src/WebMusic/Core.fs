namespace WebMusic

module Core =
    open DomainTypes

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
