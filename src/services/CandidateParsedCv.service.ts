
// Import dtos
import { CandidateParsedCvCorpEmbeddingListingFilterOptions } from "../dtos/CandidateParsedCv.dto";

// Import daos
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import libraries
import { gcpFirestoreVectorLibrary } from "../libraries/gcp-firestore-vector.library";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

class CandidateParsedCvService {
  /**
   * Formats a list of skills into a string with the given label.
   * If the skills list is empty, an empty string is returned.
   * @param {object[]} skills - List of skills objects with skillName and years properties.
   * @param {string} label - Label to be prepended to the formatted skills string.
   * @returns {string} - Formatted string with the given label and skills list.
   */
  private formatSkillsList(skills: { skillName: string; years: number }[], label: string): string {
    if (!skills?.length) return "";
    const skillsText: string = skills.map(skill => `${skill.skillName} (${skill.years} years)`).join(", ");
    return `${label}: ${skillsText}`;
  }

  /**
   * Formats a list of strings into a string with the given label.
   * If the items list is empty, an empty string is returned.
   * @param {string[]} items - List of strings to be formatted.
   * @param {string} label - Label to be prepended to the formatted items string.
   * @returns {string} - Formatted string with the given label and items list.
   */
  private formatStringArray(items: string[], label: string): string {
    if (!items?.length) return "";
    return `${label}: ${items.join(", ")}`;
  }

  private createSearchOptimizedCandidateParsedCvEmbeddingText(createData: DbCandidateParsedCvDto): string {
    const embeddingParts: string[] = [];

    if (createData.companyId) {
      embeddingParts.push(`Company ID: ${createData.companyId}`);
    }

    if (createData.currentCompany) {
      embeddingParts.push(`Current Company: ${createData.currentCompany}`);
    }

    if (createData.currentDesignation) {
      embeddingParts.push(`Current Designation: ${createData.currentDesignation}`);
    }

    if (createData.totalYOE) {
      embeddingParts.push(`Total Experience: ${createData.totalYOE} years`);
    }

    if (createData.relevantYOE) {
      embeddingParts.push(`Relevant Experience: ${createData.relevantYOE} years`);
    }

    if (createData.currentCTC) {
      embeddingParts.push(`Current CTC: ${createData.currentCTC} LPA`);
    }

    if (createData.expectedCTC) {
      embeddingParts.push(`Expected CTC: ${createData.expectedCTC} LPA`);
    }

    if (createData.noticePeriod) {
      embeddingParts.push(`Notice Period: ${createData.noticePeriod} days`);
    }

    if (createData.isNoticePeriodNegotiable) {
      const negotiable: "Yes" | "No" = createData.isNoticePeriodNegotiable ? "Yes" : "No";
      embeddingParts.push(`Notice Period Negotiable: ${negotiable}`);
    }

    if (createData.location) {
      embeddingParts.push(`Current Location: ${createData.location}`);
    }

    if (createData.readyToRelocate) {
      const relocate: "Yes" | "No" = createData.readyToRelocate ? "Yes" : "No";
      embeddingParts.push(`Ready to Relocate: ${relocate}`);
    }

    if (createData.coreSkills) {
      const coreSkillsText: string = this.formatSkillsList(createData.coreSkills, "Core Skills");
      if (coreSkillsText) {
        embeddingParts.push(coreSkillsText);
      }
    }

    if (createData.technicalSkills) {
      const techSkillsText: string = this.formatSkillsList(createData.technicalSkills, "Technical Skills");
      if (techSkillsText) {
        embeddingParts.push(techSkillsText);
      }
    }

    if (createData.userPreferredDepartments) {
      const deptText: string = this.formatStringArray(createData.userPreferredDepartments, "Preferred Departments");
      if (deptText) {
        embeddingParts.push(deptText);
      }
    }

    if (createData.userPreferredIndustries) {
      const industryText: string = this.formatStringArray(createData.userPreferredIndustries, "Preferred Industries");
      if (industryText) {
        embeddingParts.push(industryText);
      }
    }

    if (createData.userPreferredRoles) {
      const rolesText: string = this.formatStringArray(createData.userPreferredRoles, "Preferred Roles");
      if (rolesText) {
        embeddingParts.push(rolesText);
      }
    }

    if (createData.userPreferredlocations) {
      const locationsText: string = this.formatStringArray(createData.userPreferredlocations, "Preferred Locations");
      if (locationsText) {
        embeddingParts.push(locationsText);
      }
    }

    return embeddingParts.join(" | ");
  }

  async createCandidateParsedCvWithEmbedding(
    createData: DbCandidateParsedCvDto
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [Service]`, {
      methodName: this.createCandidateParsedCvWithEmbedding.name,
    });

    return candidateParsedCvDaoObj.createCandidateParsedCvWithEmbedding(
      createData,
      this.createSearchOptimizedCandidateParsedCvEmbeddingText(createData)
    );
  }

  async getAllCandidateParsedCvsByIdsWithoutPagination(
    candidateParsedCvIds: string[]
  ): Promise<DbCandidateParsedCvDto[]> {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvsByIdsWithoutPagination(
      candidateParsedCvIds
    );
  }

  async getCandidateParsedCvDetailsMapByIds(
    candidateParsedCvIds: string[]
  ): Promise<Map<string, DbCandidateParsedCvDto>> {
    const retrievedCandidateParsedCvDetails: DbCandidateParsedCvDto[] =
      await this.getAllCandidateParsedCvsByIdsWithoutPagination(
        candidateParsedCvIds
      );

    return new Map(
      retrievedCandidateParsedCvDetails.map(
        (candidateParsedCv: DbCandidateParsedCvDto) => [
          candidateParsedCv.id,
          candidateParsedCv,
        ]
      )
    );
  }

  async performGetAllCandidateParsedCvByCorporateActivities(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions
  ) {
    /**
     * @todo 
     *  1. Need to implement authorization checks
     *  2. Basic data validations
     */

    return this.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(filterOptions);
  }

  async getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions
  ) {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
      filterOptions
    );
  }

  async getCandidateParsedCvById(id: string): Promise<DbCandidateParsedCvDto | undefined> {
    return candidateParsedCvDaoObj.getCandidateParsedCvById(id);
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };