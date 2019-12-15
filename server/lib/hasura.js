const gql = require('graphql-tag');

async function setIdentiferProcessed(wsclient, identifier) {
    await wsclient.query({
        query: gql`
            mutation SetIdentifierProcessed($identifier: String!) {
            __typename
            update_archive_identifiers(where: {identifier: {_eq: $identifier}}, _set: {processed_at: "${new Date().toISOString()}"}) {
                returning {
                    identifier
                }
            }
        }
        `,
        variables: {identifier}
    });
}
module.exports.setIdentiferProcessed = setIdentiferProcessed;

async function uploadMetadata(wsclient, identifier, metadata) {
    await wsclient.query({
        query: gql`
            mutation UploadMetadata($input: archive_metadata_insert_input!) {
                insert_archive_metadata(objects: [$input], on_conflict: {update_columns: metadata, constraint: archive_metadata_pkey}) {
                    returning {
                        identifier
                    }
                }
            }
            `,
            variables: {input: {identifier, metadata}}
    });
}
module.exports.uploadMetadata = uploadMetadata;

async function uploadFiles(wsclient, identifier, files) {
    await wsclient.query({
        query: gql`
            mutation UploadFiles($input: [archive_files_insert_input!]!) {
                insert_archive_files(objects: $input, on_conflict: {update_columns: file, constraint: archive_files_pkey}) {
                    returning {
                        identifier
                    }
                }
            }
            `,
            variables: {input: files.map(file => ({identifier, name: file.$.name, file}))}
    });
}
module.exports.uploadFiles = uploadFiles;