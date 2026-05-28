import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, adminEmail } from '@/lib/email';

export async function POST(request){
  try{
    const body = await request.json();
    if(!body.name || !body.email || !body.country) return NextResponse.json({ok:false,message:'Missing fields'}, {status:400});
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('travel_leads').insert({ ...body, source:'website' }).select('*').single();
    if(error) throw error;
    const resend = getResend();
    await Promise.allSettled([
      resend.emails.send({ from:fromEmail, to:body.email, subject:'Blue Panda Travel - Travel request received', html:`<h2>Travel request received</h2><p>Hello ${body.name}, we received your travel interest for the Brazil Flag World Championship 2026.</p>` }),
      resend.emails.send({ from:fromEmail, to:adminEmail, subject:`Lead Blue Panda Travel: ${data.name}`, html:`<h2>Novo lead de viagem</h2><pre>${JSON.stringify(data,null,2)}</pre>` })
    ]);
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({ok:false,message:error.message}, {status:500});
  }
}
