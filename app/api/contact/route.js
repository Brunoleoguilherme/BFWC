import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, adminEmails } from '@/lib/email';

export async function POST(request){
  try{
    const body = await request.json();
    if(!body.name || !body.email || !body.message) return NextResponse.json({ok:false,message:'Missing fields'}, {status:400});
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('contact_messages').insert({ name:body.name, email:body.email, subject:body.subject || 'Contato pelo site', message:body.message, language:body.language || 'pt' }).select('*').single();
    if(error) throw error;
    const resend = getResend();
    await Promise.allSettled(adminEmails.map(to => resend.emails.send({ from:fromEmail, to, subject:`Contato BFWC: ${data.subject}`, html:`<h2>Novo contato</h2><p><b>Nome:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p>${data.message}</p>` })));
    return NextResponse.json({ok:true});
  }catch(error){
    return NextResponse.json({ok:false,message:error.message}, {status:500});
  }
}
