export{default} from "next-auth/middleware";

export const config = {
    matcher: ["/clora"], // Only protect try-on functionality
  };
