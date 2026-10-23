import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders={ "Access-Control-Allow-Origin":"https://suryamaster1000.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS" };
const OWNER_USER_ID="53d68054-50f2-41b5-a666-5789db48ae02";
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  try{
    const url=Deno.env.get("SUPABASE_URL"); const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEYS")||"";
    const auth=req.headers.get("Authorization")||""; if(!url||!key||!auth.startsWith("Bearer ")) return json({error:"Authentication required."},401);
    const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:{user},error:ue}=await db.auth.getUser(auth.slice(7).trim()); if(ue||!user) return json({error:"Invalid authentication session."},401);
    const {data:actor,error:ae}=await db.from("admin_users").select("role,assigned_section").eq("user_id",user.id).maybeSingle(); if(ae) throw ae;
    const role=String(actor?.role||"").toLowerCase(); const owner=user.id===OWNER_USER_ID||role==="owner"; const staff=["teacher","faculty","instructor"].includes(role);
    if(!owner&&!staff) return json({error:"Only authorized campus staff can remove students."},403);
    const body=await req.json(); const studentId=String(body?.student_id||"").trim(); if(!studentId) return json({error:"student_id is required."},400);
    const {data:student,error:se}=await db.from("profiles").select("id,name,section").eq("id",studentId).maybeSingle(); if(se) throw se;
    if(!student) return json({error:"Student profile not found."},404);
    if(staff&&student.section!==actor?.assigned_section) return json({error:"Teachers can only remove students from their assigned section."},403);
    const {error:registrationUpdateError}=await db.from("student_registrations").update({status:"removed",updated_at:new Date().toISOString()}).eq("auth_user_id",studentId);
    if(registrationUpdateError) throw registrationUpdateError;
    const {error:pe}=await db.from("profiles").delete().eq("id",studentId); if(pe) throw pe;
    const {error:au}=await db.auth.admin.deleteUser(studentId); if(au) throw au;
    return json({ok:true,name:student.name||"Student"});
  }catch(e){return json({error:e instanceof Error?e.message:"Student removal failed."},500);}
});