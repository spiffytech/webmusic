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

  type HostedFile = {
    src: RemoteContentHost
    filename: string
  }
    
  type Artist = {
    name: string
  }

  type Album = {
    name: string
  }

  type Track = {
    // What to do with this? Shouldn't be core part of Track
    file: LocalFile
    //
    title: string
    artist: Artist
    album: Album
  }

  // Generic for tracks with/without database IDs
  type AlbumTracks<'a, 'b> = {
    album: 'a
    tracks: 'b list
  }

  // Handle DB IDs by making the base datastructure (Album), plus AlbumId, and DBAlbum = (AlbumId * Album)

  type User = User of int  // Their ID in the database

  type Manifest = Manifest of string  // JSON

  // Core
  type NeedsConversion = SupportedFormats -> FileType -> bool
  type BestSupportedCodec = SupportedFormats -> FileType
  type ManifestToTracks = Manifest -> Track list
  type TracksToManifest = Track list -> Manifest

  // Shell
  type RetrieveManifest = RemoteContentHost -> Manifest
  type ConvertFiletype = LocalFile -> LocalFile
  type RetrieveFile = HostedFile -> LocalFile
