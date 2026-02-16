import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "admin@reley.io", password: "demo123", firstName: "Super", lastName: "Admin", role: "super_admin" },
    { email: "centraladmin@reley.io", password: "demo123", firstName: "Central", lastName: "Admin", role: "central_admin" },
    { email: "developer@reley.io", password: "demo123", firstName: "Dev", lastName: "User", role: "developer" },
    { email: "broker@reley.io", password: "demo123", firstName: "Broker", lastName: "User", role: "broker" },
  ];

  const results = [];

  for (const u of users) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((x) => x.email === u.email);

    if (found) {
      // Ensure correct role
      await supabase
        .from("user_roles")
        .upsert({ user_id: found.id, role: u.role }, { onConflict: "user_id" });
      results.push({ email: u.email, status: "exists", role: u.role });
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { first_name: u.firstName, last_name: u.lastName, role: u.role },
    });

    if (error) {
      results.push({ email: u.email, status: "error", error: error.message });
    } else {
      results.push({ email: u.email, status: "created", role: u.role });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
