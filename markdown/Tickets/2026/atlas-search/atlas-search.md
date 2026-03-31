
# Todo
1. admin atlas search
2. corporate atlas search
3. composite index for atlas search

1. when `searchByPrompt` follow below flow for `corporate` atlas page:
   1. [GET] `https://agency-api.dev.worko.work/candidate-parsed-cv/search-in-db/corp-action?searchByPrompt=give+me+1+year+nodejs+developer with 10lpa ctc&pageNumber=1&pageSize=200`
      1. if `searchByPrompt` in query param
         1. backend will trigger ai lambda: `worko-candidate-search-prompt-parser-dev`
            1. `worko-candidate-search-prompt-parser-dev` ai lambda will give `json response`
            ```json
            {
               "jobTitle": "",
               "salaryRange": {{"min": "", "max": ""}},
               "experienceRange": {{"min": "", "max": ""}},
               "numberOfOpenings": "",
               "workMode": "",
               "location": "",
               "noticePeriod": "",
               "typeOfEmployment": "",
               // "readyToRelocate": "Yes" | "No",
               "department": "",
               "industry": "",
               "role":"",
               "coreSkills": [],
               "softSkills": [],
               "technicalSkills": [],
               "goodToHaveSkills": [],
               "mustHaveSkills": [],
               "mandatoryRequirements": [],
               "preferredRequirements": []
            }
            ```
         2. convert the above json response to `string` format and refer below code:
            ```python
            ```
         3. use this converted string for `generateEmbedding` 
            1. if experienceRange is present then use `min` search with `>=` and `max` search with `<=` 
            2. if salaryRange is present then use `min` search with `>=` and `max` search with `<=` 
         4. try for `0.35` and next `0.4` and return
   2. [GET] `https://agency-api.dev.worko.work/candidate-parsed-cv/search-in-db/corp-action?searchByJobId=01KBEXC5QPRYFVTAJT5NXZSDDB&pageNumber=1&pageSize=200`
      1. same flow but update below:
         1. try for `0.35` and next `0.4` and return


# AI lambda trigger with `request response` invocation type
1. lambda name: `worko-candidate-search-prompt-parser-dev`
2. payload: 
   ```json
   {
      "searchByPrompt": "give me 2 years yoe dev"
   }
   ```
3. response:
```json
{
   "jobTitle": "",
   "salaryRange": {{"min": "", "max": ""}},
   "experienceRange": {{"min": "", "max": ""}},
   "numberOfOpenings": "",
   "workMode": "",
   "location": "",
   "noticePeriod": "",
   "typeOfEmployment": "",
   // "readyToRelocate": "Yes" | "No",
   "department": "",
   "industry": "",
   "role":"",
   "coreSkills": [],
   "softSkills": [],
   "technicalSkills": [],
   "goodToHaveSkills": [],
   "mustHaveSkills": [],
   "mandatoryRequirements": [],
   "preferredRequirements": []
}
```
