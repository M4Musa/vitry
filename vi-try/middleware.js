export{default} from "next-auth/middleware";

export const config = {
    matcher: ["/homepage", "/clora","/pricing","/subscription","/ProductsPage","/clora_result/:path*","/ContactUs","/AboutUs"], 
  };