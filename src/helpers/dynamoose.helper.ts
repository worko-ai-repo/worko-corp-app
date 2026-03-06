
// Import query
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";
import { ObjectType } from "dynamoose/dist/General";

// Import dtos
import { PaginatedResultsWithMatchingConditionsResponse, RecordListingFilterOptions } from "../dtos/Common.dto";

export async function getPaginatedResultsWithMatchingConditions<
    DbEntityDto,
    EntityListingFilterOptions extends RecordListingFilterOptions
>(query: Query<DbEntityDto>, entityRecordListingFilterRequest: EntityListingFilterOptions): Promise<PaginatedResultsWithMatchingConditionsResponse<DbEntityDto>> {
  /**
   * The `pageSize` will come from the request payload,
   * if no `pageSize` is provided from the request payload,
   * then default page size will be `25` which we are setting in backend internally(Refer `request.helper.ts` file)
   */
  const requestedPageSize: number = entityRecordListingFilterRequest.pageSize;

  // The `lastKeyInternal` is the `lastKey` that will be used for the next batch
  let lastKeyInternal: ObjectType | undefined = entityRecordListingFilterRequest.lastKey;
  
  // The `timesQueriedInternal` is the number of requests made to AWS DynamoDB to fulfill the query response.
  let timesQueriedInternal: number = 0;
  
  // The `queriedCountInternal` is the number of items queried in AWS DynamoDB to fulfill the query response.
  let queriedCountInternal: number = 0;

  // The `remainingPageSize` will be used to limit the number of items expected to be returned in the next batch
  let remainingPageSize: number = entityRecordListingFilterRequest.pageSize;

  // The `results` will be used to store the results of the query response from DynamoDB
  let results: DbEntityDto[] = [];

  // The `responseLastKey` is the final `lastKey` that will be returned in the response to the Frontend
  let responseLastKey: ObjectType | undefined;

  // Using Do while loop to paginate the query response from DynamoDB
  do {
    // Update the query to start at the new lastKey for the next batch
    if (lastKeyInternal) {
      query = query.startAt(lastKeyInternal);
    }

    // Update the query to limit the number of items returned in the next batch
    if (remainingPageSize > 0) {
      query = query.limit(remainingPageSize);
    }

    // Execute the query
    /*****
      SAMPLE OUTPUT OF `entityResponse`, when you log `entityResponse` in the console using `console.log(entityResponse);`:
      [
        UserDetail {...},
        UserDetail {...},
        UserDetail {...},
        .
        .
        .
        lastKey: {
          SK: 'ID#swapnaJunnuAppala',
          PK: 'USR#EML#swapnaAppalaMrudula@gmail.com',
          GSI1PK: 'USR#',
          GSI1SK: 'ID#swapnaJunnuAppala'
        },
        count: 10,
        queriedCount: undefined,
        timesQueried: 1,
        populate: [Function: PopulateItems],
        toJSON: [Function: itemToJSON]
      ]
      *****/
    const entityResponse: QueryResponse<DbEntityDto> = await query.exec();

    /**
     * It updates timesQueriedInternal by adding entityResponse.timesQueried,
     * If entityResponse.timesQueried is `null` or `undefined`, the `??` (nullish coalescing operator) ensures that 0 is used instead.
     */
    timesQueriedInternal += entityResponse.timesQueried ?? 0;

    /**
     * It updates queriedCountInternal by adding entityResponse.timesQueried,
     * If entityResponse.timesQueried is `null` or `undefined`, the `??` (nullish coalescing operator) ensures that 0 is used instead.
     */
    queriedCountInternal += entityResponse.queriedCount ?? 0;

    // Add the results to the `results` array
    /*****
      SAMPLE OUTPUT OF `results`, when you log `results` in the console  using `console.log(results)`:
      [
        UserDetail {...},
        UserDetail {...},
        UserDetail {...},
        .
        .
      ]
      *****/
    results.push(...entityResponse);

    // If the number of results is equal to the page size or lastKey doesn't exist, then update the `lastKeyInternal` and `remainingPageSize`
    if (!entityResponse.lastKey || results.length === requestedPageSize) {
      lastKeyInternal = undefined;
      remainingPageSize = 0;
      responseLastKey = entityResponse.lastKey;

      // Break the do while loop and return the results of the query
      break;
    }

    // If the number of results is less than the page size and lastKey exists, then update the `lastKeyInternal` and `remainingPageSize`
    if (results.length < requestedPageSize && entityResponse.lastKey) {
      // Update the `lastKeyInternal` for the next batch
      lastKeyInternal = entityResponse.lastKey;

      // Update the `remainingPageSize` by subtracting the number of results to limit the number of items returned in the next batch
      remainingPageSize = requestedPageSize - results.length;
    }

    // Update the `responseLastKey`
    responseLastKey = entityResponse.lastKey;
  } while (lastKeyInternal && results.length < requestedPageSize);

  // Create the final results of the paginated response
  /*****
    SAMPLE OUTPUT OF `finalResults` when you log `finalResults` in the console using `console.log(finalResults);`:
    {
        '0': UserDetail {...},
        '1': UserDetail {...},
        '2': UserDetail {...},
        .
        .
        lastKey: {
            SK: 'ID#swapnaJunnuAppala',
            PK: 'USR#EML#swapnaAppalaMrudula@gmail.com',
            GSI1PK: 'USR#',
            GSI1SK: 'ID#swapnaJunnuAppala'
        },
        count: 10,
        timesQueried: 1,
        queriedCount: 0
    }
    *****/
  const finalResults: PaginatedResultsWithMatchingConditionsResponse<DbEntityDto> =
    {
      ...results,
      lastKey: responseLastKey,
      count: results.length,
      timesQueried: timesQueriedInternal,
      queriedCount: queriedCountInternal,
    };
  
  global.logger.debug(`pagination details`, {
    filePath: __filename,
    methodName: getPaginatedResultsWithMatchingConditions.name
  });

  // Return the final results of the paginated response
  return finalResults;
};