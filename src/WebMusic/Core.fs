namespace WebMusic

module Core =
    open DomainTypes

    let selectBestFormat supportedFormats =
        supportedFormats
        |> List.sort
        |> List.head
