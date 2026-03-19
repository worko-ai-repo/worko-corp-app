
# For large file names
1. in `bulkSourceTypeResumes` gcp firestore collection `totalLargeResumesUploaded` will be stored if there are large files
2. in `bulkSourceTypeParseResumes` gcp firestore collection `userResumeFileName` will be stored when status is `LARGE_RESUME_FILE`

# For invalid file names
1. in `bulkSourceTypeResumes` gcp firestore collection `totalInvalidFileNamesUploaded` will be stored if there are invalid files
2. in `bulkSourceTypeParseResumes` gcp firestore collection `userResumeFileName` will be stored when status is `INVALID_FILE_NAME`
