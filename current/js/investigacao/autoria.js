// Vocabulário de autoria comum. Conteúdo e critérios ficam nos episódios, não nos nomes das cenas.
export const T=(pt,en)=>({pt,en});
export const opcao=(id,pt,en,ok,ptRet,enRet)=>({id,txt:T(pt,en),ok:ok===true,retorno:T(ptRet,enRet)});
export const escolha=(id,pt,en,textoPt,textoEn,perguntaPt,perguntaEn,opcoes,extra={})=>({id,tipo:'escolha',titulo:T(pt,en),texto:T(textoPt,textoEn),pergunta:T(perguntaPt,perguntaEn),opcoes,...extra});
export function hipotese(id,tituloPt,tituloEn,textoPt,textoEn,opcoes){
 return {id,tipo:'registro',titulo:T(tituloPt,tituloEn),texto:T(textoPt,textoEn),pergunta:T('Qual é a sua explicação inicial? Ela será guardada para comparação, sem nota.','What is your initial explanation? It will be saved for comparison, without a score.'),opcoes,retornoRegistro:T('Hipótese guardada. Procure evidências antes de decidir.','Hypothesis saved. Look for evidence before deciding.')};
}
export const cartoes=(id,pt,en,textoPt,textoEn,lista)=>({id,tipo:'cartoes',titulo:T(pt,en),texto:T(textoPt,textoEn),pergunta:T('Selecione todas as afirmações sustentadas pela investigação.','Select every statement supported by the investigation.'),cartoes:lista,registrarMural:true});
export const evidencia=(perguntaPt,perguntaEn,opcoes)=>({pergunta:T(perguntaPt,perguntaEn),opcoes});
