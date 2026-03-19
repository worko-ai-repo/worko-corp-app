// Load Service for generating ULID (Universally Unique Lexicographically Sortable Identifier).
import { v4 } from "uuid";


class UuidService {

  getUuid(): string {
    return v4();
  }
}

const uuidServiceObj = new UuidService();
export {
  uuidServiceObj,
  UuidService
};
