serve(async (req) => {
  try {
       // Verify state from database
       const {state, profile_id} = await req.json();

       const { data: storedState, error: stateError } = await supabase
           .from("oauth_states")
            .select("*")
           .eq("state", state)
            .single();

         if (stateError || !storedState) {
                throw new Error("Invalid state parameter");
            }


    // Exchange code for access token
              const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                         grant_type: 'authorization_code',
                          client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
                          client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
                        redirect_uri: `${Deno.env.get("PUBLIC_URL")!}/oauth/zoho`,
                         code: code!,
                    })
               });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

      
        const {data: tokenDataDb, error: tokenError} = await supabase.from('zoho_credentials')
             .select("*")
             .eq("profile_id", profile_id)
            .eq("platform_type", "zoho_desk")
            .single();

        if(tokenError || !tokenDataDb){
              throw new Error("Error getting tokens")
        }

       // Store the connection
         const { error: insertError } = await supabase
                .from("platform_connections")
                .insert([
                       {
                           profile_id: profile_id,
                         platform_name: "zoho",
                       auth_tokens: tokenDataDb,
                     },
                   ]);

           if (insertError) {
                throw new Error(`Failed to store connection`);
               }

     // Clean up the used state
          await supabase.from("oauth_states").delete().eq("state", state);

           return new Response(JSON.stringify({success: true}), {
                 headers: { ...corsHeaders, "Content-Type": "application/json" },
           });


} catch (error) {
  console.error("Error in Zoho connection", error);
    return new Response(JSON.stringify({success: false, error: error.message}), {
      status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
});