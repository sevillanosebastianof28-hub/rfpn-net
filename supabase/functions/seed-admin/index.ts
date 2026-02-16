import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "admin@reley.io";
  const password = "demo123";

  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);

  if (found) {
    // Ensure role is super_admin
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", found.id)
      .maybeSingle();

    if (role?.role !== "super_admin") {
      await supabase
        .from("user_roles")
        .upsert({ user_id: found.id, role: "super_admin" }, { onConflict: "user_id" });
    }

    return new Response(JSON.stringify({ message: "Admin already exists", userId: found.id }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create user with auto-confirm
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: "Super", last_name: "Admin", role: "super_admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Admin created", userId: newUser.user.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
