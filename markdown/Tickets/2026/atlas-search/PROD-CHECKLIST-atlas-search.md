
# Pre-Production checklist
1. Create below vector indexes in `worko-corp-db-prod` database in `candidateParsedCvs` in `ascending` order
```sh
Index 1:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      currentCTC (Ascending)

      relevantYOE (Ascending)

Index 2:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      currentCTC (Ascending)

Index 3:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      relevantYOE (Ascending)

Index 4:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      companyId (Ascending)

      currentCTC (Ascending)

      relevantYOE (Ascending)

Index 5:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      companyId (Ascending)

      currentCTC (Ascending)

Index 6:
   Query scope: Collection

   Collection ID: candidateParsedCvs

   Vector field path: embeddingVector

   Dimensions: 768

   Additional fields to index:
      companyId (Ascending)
      relevantYOE (Ascending)
```

# Deployments
1. `dev` branch of `worko-corp-app`, `worko-job-app` repositories
2. `worko-candidate-search-prompt-parser-prod` aws lambda function -> check with ai team
