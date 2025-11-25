require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

async function createUsers() {
	console.log("🚀 Creating users in Supabase Auth...\n");

	const users = [
		{
			email: "admin@workhq.com",
			password: "Admin@123",
			role: "ADMIN",
			fullName: "Admin User",
			employeeId: "EMP001",
			department: "Management",
			position: "System Administrator",
			phone: "+8801700000001",
		},
		{
			email: "hr@workhq.com",
			password: "Hr@123",
			role: "HR",
			fullName: "HR Manager",
			employeeId: "EMP002",
			department: "Human Resources",
			position: "HR Manager",
			phone: "+8801700000002",
		},
		{
			email: "employee@workhq.com",
			password: "Employee@123",
			role: "EMPLOYEE",
			fullName: "John Employee",
			employeeId: "EMP003",
			department: "Engineering",
			position: "Software Developer",
			phone: "+8801700000003",
		},
	];

	const createdUsers = [];

	for (const user of users) {
		try {
			console.log(`📝 Creating ${user.role}: ${user.email}`);

			// Create user in Supabase Auth with all metadata
			const { data: authData, error: authError } =
				await supabaseAdmin.auth.admin.createUser({
					email: user.email,
					password: user.password,
					email_confirm: true,
					user_metadata: {
						role: user.role,
						full_name: user.fullName,
						employee_id: user.employeeId,
						department: user.department,
						position: user.position,
						phone: user.phone,
					},
				});

			if (authError) {
				console.error(`   ❌ Error: ${authError.message}`);
				continue;
			}

			console.log(`   ✅ User created successfully!`);
			console.log(`   🆔 User ID: ${authData.user.id}`);
			console.log(`   📧 Email: ${user.email}`);
			console.log(`   🔑 Password: ${user.password}`);
			console.log(`   👤 Role: ${user.role}`);
			console.log("");

			createdUsers.push({
				id: authData.user.id,
				email: user.email,
				password: user.password,
				role: user.role,
			});
		} catch (error) {
			console.error(`   ❌ Unexpected error: ${error.message}`);
			console.log("");
		}
	}

	console.log("\n✅ User creation completed!\n");
	console.log("╔═══════════════════════════════════════════════════════╗");
	console.log("║          📋 LOGIN CREDENTIALS - WorkHQ                ║");
	console.log("╠═══════════════════════════════════════════════════════╣");
	console.log("║                                                       ║");
	console.log("║  👨‍💼 ADMIN:                                            ║");
	console.log("║     📧 Email: admin@workhq.com                        ║");
	console.log("║     🔑 Password: Admin@123                            ║");
	console.log("║                                                       ║");
	console.log("║  👔 HR MANAGER:                                       ║");
	console.log("║     📧 Email: hr@workhq.com                           ║");
	console.log("║     🔑 Password: Hr@123                               ║");
	console.log("║                                                       ║");
	console.log("║  👤 EMPLOYEE:                                         ║");
	console.log("║     📧 Email: employee@workhq.com                     ║");
	console.log("║     🔑 Password: Employee@123                         ║");
	console.log("║                                                       ║");
	console.log("╚═══════════════════════════════════════════════════════╝");
	console.log(
		`\n🎉 Successfully created ${createdUsers.length} out of 3 users!`
	);
	console.log("\n💡 Tips:");
	console.log("   ✓ All user profiles are stored in user_metadata");
	console.log(
		"   ✓ Users can login immediately - no email verification needed"
	);
	console.log("   ✓ Use these credentials in your WorkHQ mobile app");
	console.log("\n🚀 Ready to login and test the application!\n");
}

createUsers().catch(console.error);
