
```ts
about: string;
education: {
	collage: string;
	degree: string;
	startedYear?: number;
	passingYear: number;
	grade?: string;
	field?: string;
}[];
multipleCandidateExperience?: {
   companyId?: string;
   companyName: string;
   designation: string;
   department?: string;
   YOE?: number;
   startDate?: string;

   /**
    * endDate
    *
    * @description if endDate is not provided or empty string, it will be considered as ongoing experience
    */
   endDate?: string;
}[];
```


1. `worko-resume-parser-dev` for `agency user submission`
   1. include `about`, `education`, `multipleCandidateExperience` 
2. include `about`, `education`, `multipleCandidateExperience` in `cvExtractedParsed` in `worko-bulk-jd-resume-matching`
3. include `about`, `education`, `multipleCandidateExperience` in `cvExtractedParsed` in `worko-agency-bulk-jd-resume-matching-dev`
4. `worko-cand-profile-parser-dev`
5. `worko-referral-source-cand-profile-parser-dev`
