
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";
import { Resend } from "npm:resend@2.0.0";

// Setup CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  userId: string;
  userEmail: string;
  userName?: string;
}

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get project URL for links back to the admin panel
    const url = new URL(req.url);
    const projectUrl = `${url.protocol}//${url.host}`;
    const adminPanelUrl = `${projectUrl}/admin`;
    
    // Parse request body
    const { userId, userEmail, userName } = await req.json() as NotifyRequest;
    
    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query admin emails
    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Error fetching admin emails:", adminsError);
      throw new Error("Failed to fetch admin emails");
    }

    // Check if we have admins to notify
    if (!admins || admins.length === 0) {
      console.warn("No admin users found to notify");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Extract admin emails
    const adminEmails = admins.map(admin => admin.email).filter(Boolean);
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email to each admin
    const emailPromises = adminEmails.map(async (adminEmail) => {
      if (!adminEmail) return null;
      
      try {
        const displayName = userName || userEmail.split("@")[0];
        
        const emailResponse = await resend.emails.send({
          from: "Admin Notifications <notifications@resend.dev>",
          to: adminEmail,
          subject: "New User Approval Request",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h2>New User Waiting for Approval</h2>
              <p>A user is waiting for approval.</p>
              <p><strong>User:</strong> ${displayName} (${userEmail})</p>
              <div style="margin: 25px 0;">
                <a href="${adminPanelUrl}" style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Go to Admin Panel
                </a>
              </div>
              <p style="color: #666; font-size: 12px;">This is an automated notification.</p>
            </div>
          `,
        });
        
        console.log(`Email sent to admin ${adminEmail}:`, emailResponse);
        return emailResponse;
      } catch (emailError) {
        console.error(`Failed to send email to admin ${adminEmail}:`, emailError);
        return null;
      }
    });

    // Wait for all email sending attempts to complete
    const results = await Promise.all(emailPromises);
    const successCount = results.filter(Boolean).length;

    // Return response
    return new Response(
      JSON.stringify({ 
        message: `Notification sent to ${successCount} admin(s)`,
        success: successCount > 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in notify-admin function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
