import { AuthenUser } from "../../dto/authen.dto";

declare global {
    namespace Express {
      interface User extends AuthenUser {}
    }
  }