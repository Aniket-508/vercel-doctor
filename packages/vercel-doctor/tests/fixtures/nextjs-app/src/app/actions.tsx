"use server";

export async function createUser(formData: FormData) {
  const name = formData.get("name");
  console.log("Creating user:", name);
  return { success: true };
}

export async function deleteUser(userId: string) {
  console.log("Deleting user:", userId);
  return { success: true };
}
