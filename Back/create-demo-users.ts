import dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

interface UserData {
	email: string;
	password: string;
	fullName: string;
	role: Role;
	employeeCode: string;
	department: string;
	designation: string;
	salary: number;
}

const demoUsers: UserData[] = [
	{
		email: "admin@workhq.com",
		password: "admin123",
		fullName: "Admin User",
		role: Role.ADMIN,
		employeeCode: "EMP001",
		department: "Administration",
		designation: "System Administrator",
		salary: 100000,
	},
	{
		email: "hr@workhq.com",
		password: "hr123",
		fullName: "HR Manager",
		role: Role.HR,
		employeeCode: "EMP002",
		department: "Human Resources",
		designation: "HR Manager",
		salary: 80000,
	},
	{
		email: "employee@workhq.com",
		password: "emp123",
		fullName: "John Employee",
		role: Role.EMPLOYEE,
		employeeCode: "EMP003",
		department: "Engineering",
		designation: "Software Developer",
		salary: 60000,
	},
];

async function createDemoUsers() {
	console.log("🚀 Starting demo users creation...\n");

	for (const userData of demoUsers) {
		try {
			console.log(`Creating ${userData.role}: ${userData.email}...`);

			// 1. Create auth user in Supabase
			const { data: authData, error: authError } =
				await supabase.auth.admin.createUser({
					email: userData.email,
					password: userData.password,
					email_confirm: true,
					user_metadata: {
						full_name: userData.fullName,
					},
				});

			if (authError) {
				console.error(
					`❌ Auth error for ${userData.email}:`,
					authError.message
				);
				continue;
			}

			console.log(`  ✅ Auth user created: ${authData.user.id}`);

			// 2. Create user in database
			const user = await prisma.user.create({
				data: {
					id: authData.user.id,
					email: userData.email,
					fullName: userData.fullName,
					role: userData.role,
					avatarUrl: null,
				},
			});

			console.log(`  ✅ Database user created: ${user.id}`);

			// 3. Create employee record
			const employee = await prisma.employee.create({
				data: {
					userId: user.id,
					employeeCode: userData.employeeCode,
					department: userData.department,
					designation: userData.designation,
					joinDate: new Date(),
					salary: userData.salary,
				},
			});

			console.log(`  ✅ Employee record created: ${employee.employeeCode}`);
			console.log(`  📧 Login: ${userData.email} / ${userData.password}\n`);
		} catch (error: any) {
			console.error(`❌ Error creating ${userData.email}:`, error.message);
			console.log("");
		}
	}

	console.log("✅ Demo users creation completed!\n");
	console.log("📋 Summary:");
	console.log("Admin:    admin@workhq.com    / admin123");
	console.log("HR:       hr@workhq.com       / hr123");
	console.log("Employee: employee@workhq.com / emp123");
}

createDemoUsers()
	.catch(console.error)
	.finally(async () => {
		await prisma.$disconnect();
	});
