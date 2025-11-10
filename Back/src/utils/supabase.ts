import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (
	!supabaseUrl ||
	!supabaseServiceKey ||
	supabaseUrl === "placeholder" ||
	supabaseServiceKey === "placeholder"
) {
	console.warn(
		"⚠️  Supabase environment variables not configured. Auth features will not work."
	);
	console.warn(
		"   Please update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file"
	);
}

// Admin client with service role key for backend operations
export const supabaseAdmin = createClient(
	supabaseUrl || "https://placeholder.supabase.co",
	supabaseServiceKey || "placeholder",
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

export default supabaseAdmin;
