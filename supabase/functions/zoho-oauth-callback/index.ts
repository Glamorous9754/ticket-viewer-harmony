serve(async (req) => {

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
    if (code && state) {
          try {
              // Verify state to prevent CSRF
             const { data: storedState, error: fetchError } = await supabase.from('oauth_states')
             .select('*')
             .eq('state', state)
             .single();
           
             if (fetchError || !storedState) {
                   throw new Error("Invalid or missing state parameter");
             }
  
  
          // Exchange authorization code for tokens
               const tokenResponse = await fetch('https://accounts.zoho.in/oauth/v2/token', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     body: new URLSearchParams({
                          grant_type: 'authorization_code',
                          client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
                          client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
                         redirect_uri: redirectUri,
                          code: code!,
                     })
                });
  
  
               const tokenData = await tokenResponse.json();
               console.log("Token Data", tokenData);
  
                 if (!tokenResponse.ok) {
                      console.error(tokenData);
                       throw new Error(`Token exchange failed: ${tokenData.error_description}`);
                    }
  
                 const { access_token, refresh_token, expires_in } = tokenData;
  
  
                   // Store tokens in Supabase
                 const { error: insertError } = await supabase.from('zoho_credentials').insert([
                         {
                              profile_id: storedState.profile_id,
                              access_token: access_token,
                              refresh_token: refresh_token,
                              expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
                              platform_type: 'zoho_desk',
                               status:"active"
                          },
                      ]);
  
  
                     if (insertError) {
                        throw new Error(`Failed to store tokens: ${insertError.message}`);
                     }
          
          
                     // Optionally, delete the used state to prevent reuse
                     await supabase.from('oauth_states').delete().eq('state', state);
                 
          // Redirect user to frontend
           return new Response(null, {
                       status: 302,
                        headers: {
                              'location': 'https://preview-ticket-viewer-harmony.lovable.app/features',
                            ...corsHeaders
                      }
               });
  
  
            } catch (error) {
               console.error("Oauth Callback Error", error);
                return new Response(JSON.stringify({success: false, error: error.message}),{
                   status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                 });
             }
    }
         
      //Handle Oauth Initiation
       try {
           // Require Authorization header
               const authHeader = req.headers.get('authorization');
       
                 if (!authHeader) {
                     return new Response(JSON.stringify({ code: 401, message: "Missing authorization header" }), {
                       status: 401,
                       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                     });
                 }
  
  
       //Verify JWT Token with Supabase
             const token = authHeader.replace("Bearer ", "");
            const { data:user, error: userError } = await supabase.auth.getUser(token);
  
               if (userError || !user) {
                  return new Response(JSON.stringify({ code: 401, message: "Invalid token" }), {
                       status: 401,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                      });
                    }
  
  
           // Generate a unique state parameter for CSRF protection
               const newState = crypto.randomUUID();
  
  
           // Store state in Supabase
              const { error: stateError } = await supabase.from("oauth_states").insert({
                   profile_id: user.user.id,
                  state: newState,
                  platform_type: 'zoho_desk'
               });
  
  
             if (stateError) {
                   throw new Error("Failed to store state");
             }
  
  
           // Construct Zoho OAuth URL
                 const authUrl = new URL('https://accounts.zoho.in/oauth/v2/auth');
                  authUrl.searchParams.set('response_type', 'code');
                 authUrl.searchParams.set('client_id', Deno.env.get("ZOHO_CLIENT_ID")!);
                 authUrl.searchParams.set('scope', 'Desk.tickets.READ');
                authUrl.searchParams.set('redirect_uri', redirectUri);
                  authUrl.searchParams.set('access_type', 'offline');
                authUrl.searchParams.set('state', newState);
               authUrl.searchParams.set('prompt', 'consent');
  
  
           return new Response(JSON.stringify({ success: true, url: authUrl.toString() }), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
               });
  
  
       } catch(error) {
             console.error("OAuth Initiation Error", error)
              return new Response(JSON.stringify({ success: false, error: error.message}),{
                  status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
  
       }
  });