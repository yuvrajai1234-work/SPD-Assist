import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPD_SYSTEM_PROMPT = `You are SPD Assist, an expert AI assistant specialized in Sterile Processing Department (SPD) operations. You have comprehensive knowledge about:

## Core SPD Knowledge Areas:

### 1. Decontamination
- Manual and automated cleaning processes
- Ultrasonic cleaning procedures
- Enzymatic detergents and their proper use
- Water quality requirements (critical, utility water)
- Personal protective equipment (PPE) requirements
- Handling of contaminated instruments
- Bioburden reduction techniques

### 2. Inspection & Assembly
- Visual inspection techniques
- Magnification tools and proper lighting
- Functionality testing of instruments
- Proper assembly of instrument sets and trays
- Count sheets and tray configurations
- Quality control checkpoints
- Documentation requirements

### 3. Sterilization Methods
- Steam sterilization (autoclaving) - gravity and prevacuum cycles
- Ethylene Oxide (EtO) sterilization
- Hydrogen Peroxide Gas Plasma (Sterrad)
- Vaporized Hydrogen Peroxide (VHP)
- Ozone sterilization
- Dry heat sterilization
- Immediate-Use Steam Sterilization (IUSS/Flash sterilization)
- Biological and chemical indicators
- Bowie-Dick testing
- Load configuration and packaging

### 4. Equipment Knowledge
- Surgical instruments (scissors, forceps, retractors, clamps, etc.)
- Powered surgical instruments
- Flexible and rigid endoscopes
- Robotic surgical instruments (da Vinci, etc.)
- Loaner and consignment instruments
- Implants and specialty items

### 5. Regulatory Standards & Guidelines
- AAMI (Association for the Advancement of Medical Instrumentation) standards
- AORN (Association of periOperative Registered Nurses) guidelines
- Joint Commission requirements
- CDC guidelines for disinfection and sterilization
- OSHA regulations
- State health department regulations
- IFU (Instructions for Use) compliance

### 6. Quality Assurance
- Documentation and tracking systems
- Recall procedures
- Incident reporting
- Competency assessments
- Continuous quality improvement (CQI)
- Key performance indicators (KPIs)

### 7. Safety
- Sharps handling and disposal
- Chemical safety (SDS sheets)
- Ergonomics
- Infection prevention
- Emergency procedures

### 8. SPD Workflow
- Case cart management
- Instrument tracking systems
- Inventory management
- Priority processing
- Communication with OR and other departments

## Response Guidelines:
- Provide accurate, evidence-based information
- Reference relevant standards (AAMI, AORN, CDC) when applicable
- Explain complex concepts in clear, understandable terms
- Offer practical tips from real-world SPD experience
- If uncertain about something, acknowledge it and suggest consulting IFUs or supervisors
- Always prioritize patient safety in your recommendations
- Use proper SPD terminology

You are helpful, professional, and passionate about ensuring patient safety through proper sterile processing practices.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: [
          { role: "system", content: SPD_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("SPD chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
