
# Admin dashboard
1. 
[POST] `https://agency-api.dev.worko.work/bulk-source-type-resume/`
```json
{
  "totalResumesUploaded": 1, // only valid count

  // send below key name only when large cvs are present
  "totalLargeResumesUploaded": 2,

  "totalInvalidFileNamesUploaded": 1
}
```

2. 
[POST] `https://agency-api.dev.worko.work/central-candidate-profile/resumes`
```json
{
  "bulkCvs": [
      { 
         "bulkSourceTypeParseResumeStatus": "LARGE_RESUME_FILE",
         "fileMimeType": "application/pdf", 
         "fileName": "candi11.pdf" 
      },
      { 
         "bulkSourceTypeParseResumeStatus": "INVALID_FILE_NAME",
         "fileMimeType": "application/pdf", 
         "fileName": "candi12.pdf" 
      },
      { 
         "fileMimeType": "application/pdf", 
         "fileName": "candi10.pdf" 
      },
   ],
  "bulkSourceTypeResumeId": "01KKE43BQR4TFQDV7JF9Y84CM5"
}
```



# Corporate dashboard
1. 
[POST] `https://agency-api.dev.worko.work/bulk-source-type-resume/`
```json
{
  "totalResumesUploaded": 1, // only valid count

  // send below key name only when large cvs are present
  "totalLargeResumesUploaded": 2,

  "totalInvalidFileNamesUploaded": 1
}
```

2. 
[POST] `https://agency-api.dev.worko.work/corporate-candidate-profile/resumes`
```json
{
  "bulkCvs": [
      { 
         "bulkSourceTypeParseResumeStatus": "LARGE_RESUME_FILE",
         "fileMimeType": "application/pdf", 
         "fileName": "candi11.pdf" 
      },
      { 
         "bulkSourceTypeParseResumeStatus": "INVALID_FILE_NAME",
         "fileMimeType": "application/pdf", 
         "fileName": "candi12.pdf" 
      },
      { 
         "fileMimeType": "application/pdf", 
         "fileName": "candi10.pdf" 
      },
   ],
  "bulkSourceTypeResumeId": "01KKE43BQR4TFQDV7JF9Y84CM5"
}
```
