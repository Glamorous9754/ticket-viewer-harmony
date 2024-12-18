serve(async (req) => {
  try{
      const { orgId, clientID, clientSecret } = await req.json();

      if(!orgId || !clientID || !clientSecret){
           throw new Error("Missing required credentials")
      }

      
     const {data: tokenDataDb, error: tokenError} = await supabase.from('zoho_credentials')
         .select("*")
         .eq("profile_id", profile_id)
        .eq("platform_type", "zoho_desk")
        .single();

      if(tokenError || !tokenDataDb){
          throw new Error("Error getting tokens")
      }

    const {access_token, refresh_token} = tokenDataDb;
 
 console.log("Validation successful");
   return new Response(JSON.stringify({ success: true , access_token: access_token }),{
       headers:{...corsHeaders, "Content-Type":"application/json"}
   });
  }catch(error){
       console.error("Error validating Zoho credentials", error);
         return new Response(JSON.stringify({ success: false, error: error.message }), {
                status: 500,
                 headers: { ...corsHeaders, "Content-Type": "application/json" },
           });
   }
})