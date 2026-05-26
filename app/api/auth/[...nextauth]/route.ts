import { handlers } from "../../../../auth";

// handles all '/api/auth/*' requests including 
// session management and callbacks
export const { GET, POST } = handlers;