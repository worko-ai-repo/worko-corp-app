// Import enums
import { GcpFirestoreSortOrderTypeEnum } from "../enums/Common.gcp-firestore.enum";

/**
 * GcpFirestoreRecordListingFilterOptions
 *
 * It is similar to "GcpFirestoreRecordListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface GcpFirestoreRecordListingFilterOptions {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey
   */
  lastKey?: {
    /**
     * @reference The "id" field of the firestore document
     * @example "01K8TPT1PT2W5DTRSFPWTB92GH"
     */
    gcpFirestoreDocumentId: string;
  };

  // sortOrder means the order in which the records should be sorted.
  sortOrder?: GcpFirestoreSortOrderTypeEnum;

  // search text
  searchText?: string;

  /**
   * fromDate
   *
   * The "fromDate" value will be come from frontend request payload.
   *
   * Sample Value of "fromDate": "2024-07-01T11:07:42.506Z"
   */
  fromDate?: string;

  /**
   * toDate
   *
   * The "toDate" value will be come from frontend request payload.
   *
   * Sample Value of "toDate": "2024-07-01T12:07:42.506Z"
   */
  toDate?: string;
}

/**
 * GcpFirestoreRecordListingFilterRequestDTO
 *
 * The possible data expected in the request payload if API wants to filter the data.
 */
export interface GcpFirestoreRecordListingFilterRequestDTO {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: string; // The pageSize value will be come from frontend request query params, so it will be a string

  /**
   * lastKey 
   *
   * Sample Value: "WzE3NDAzOTY2NDE0MzEsIjE0MzA3MDQwMzIiXQ"
   */
  lastKey?: string;

  // sortOrder means the order in which the records should be sorted.
  sortOrder?: GcpFirestoreSortOrderTypeEnum;

  // search text
  searchText?: string;

  /**
   * fromDate
   *
   * The "fromDate" value will be come from frontend request payload.
   *
   * Sample Value of "fromDate": "2024-07-01T11:07:42.506Z"
   */
  fromDate?: string;

  /**
   * toDate
   *
   * The "toDate" value will be come from frontend request payload.
   *
   * Sample Value of "toDate": "2024-07-01T12:07:42.506Z"
   */
  toDate?: string;
}

/**
 * GcpFirestoreRecordListingPaginationResponseDTO
 *
 * The representation of the pagination details that would be passed to the API consumer.
 */
export interface GcpFirestoreRecordListingPaginationResponseDTO {
  // The number of records returned back in the API response.
  count: number;

  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey 
   *
   * Sample Value: "WzE3NDAzOTY2NDE0MzEsIjE0MzA3MDQwMzIiXQ"
   */
  lastKey?: string;

  // sortOrder means the order in which the records should be sorted.
  sortOrder?: GcpFirestoreSortOrderTypeEnum;
}

/**
 * GcpFirestoreRecordListingResponseDTO
 *
 * The main response would be retruend back in the API response. It would include the pagination details and records.
 */
export interface GcpFirestoreRecordListingResponseDTO<EntityDetails> {
  data: EntityDetails;
  pagination: GcpFirestoreRecordListingPaginationResponseDTO;
}
