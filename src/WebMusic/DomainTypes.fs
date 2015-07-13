namespace WebMusic

[<AutoOpen>]
module DomainTypes =
  let (@@) fn x = fn x

  // Sorted by preferred order, so we can transcode to the best supported file
  // format
  type FileType =
    | WAV
    | OGG
    | AAC
    | MP3
    | WMA

  type SupportedFormats = FileType list
  
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

  type Manifest = Manifest of string  // JSON

  // Core
  type NeedsConversion = SupportedFormats -> FileType -> bool
  type BestSupportedCodec = SupportedFormats -> FileType
  type ManifestToTracks = Manifest -> Track list
  type TracksToManifest = Track list -> Manifest

  // Shell
  type RetrieveManifest = RemoteContentHost -> Manifest
  type ConvertFiletype = LocalFile -> LocalFile
  type RetrieveFile = RemoteFile -> LocalFile
