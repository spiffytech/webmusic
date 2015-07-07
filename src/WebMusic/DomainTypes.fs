namespace WebMusic

[<AutoOpen>]
module DomainTypes =
  // Sorted by preferred order, so we can transcode to the best supported file
  // format
  type FileType =
    | WAV
    | OGG
    | AAC
    | MP3
    | WMA

  type LocalFile = {
      filename: string
      fileType: FileType
  }

  type RemoteContentHost =
    | HTTP of string

  type RemoteFile = {
    src: RemoteContentHost
    filename: string
  }
    
  type Track = {
    file: LocalFile
    title: string
    artist: string
    album: string
  }

  type Manifest = Manifest of string

  type RetrieveManifest = RemoteContentHost -> Manifest
  type ManifestToTracks = Manifest -> Track list
  type ConvertFiletype = LocalFile -> LocalFile
  type RetrieveFile = RemoteFile -> LocalFile
  type BestSupportedCodec = FileType list -> FileType
  type NeedsConversion = FileType list -> FileType -> bool
