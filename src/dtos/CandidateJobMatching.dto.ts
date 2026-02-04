import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";


export interface CandidateJobMatchingListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
   /**
    * @example ["XXXX","YYYY","ZZZZ"]
    * @reference "id" fields of CandidateJobMatching.model.ts
    */
   candidateJobMatchingIds: string[]
}

export interface CandidateJobMatchingListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
   /**
    * @example "XXXX,YYYY,ZZZZ"
    * @reference "id" fields of CandidateJobMatching.model.ts
    */
   candidateJobMatchingIds: string
}