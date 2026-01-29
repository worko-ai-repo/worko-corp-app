
```ts
about?: string;
education?: {
  collage: string;
  degree: string;
  startedYear?: number;
  passingYear: number;
  grade?: string;
  field?: string;
}[];
```

1. Include `about` and `education` in response for `worko-resume-parser-dev`
```js
{
  agencyUserId: string;
  companyId: string;
  jobId: string;
  candidateParsedCvAwsS3FileName: string;
}
```

2. Store `about` and `education` in `cvExtractedParsed` in `worko-bulk-jd-resume-matching`
3. Store `about` and `education` in `cvExtractedParsed` in `worko-agency-bulk-jd-resume-matching-dev`
4. Include `about` and `education` in response for `worko-cand-profile-parser-dev`
5. Include `about` and `education` in response for `worko-referral-source-cand-profile-parser-dev`
