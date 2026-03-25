{user ? (
  <button
    onClick={async () => {
      await supabase.auth.signOut();
      navigate("/");
    }}
    className="text-sm text-red-500"
  >
    Logout
  </button>
) : (
  <button
    onClick={() => navigate("/login")}
    className="text-sm text-[#5B5FEF]"
  >
    Login
  </button>
)}