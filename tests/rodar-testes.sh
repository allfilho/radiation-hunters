#!/bin/bash
# Roda a suíte de testes em primeiro plano, em paralelo, com orçamento de tempo e retomada.
#
# Uso (dentro de tests/):
#   bash rodar-testes.sh                 roda os testes que faltam (retoma; refaz os que falharam)
#   bash rodar-testes.sh 72 73           só os arquivos cujo nome contém 72 ou 73
#   bash rodar-testes.sh --reset         apaga os resultados e começa do zero
#   bash rodar-testes.sh -j 4            4 testes ao mesmo tempo (padrão: 2)
#   bash rodar-testes.sh --orcamento 0   sem limite de tempo (padrão: 540 s, para caber numa chamada de ferramenta)
#
# Resultados em ../logs/ (um .ok, .fail e .log por arquivo). Se qualquer arquivo de current/ ou tests/ mudar,
# os resultados antigos são descartados sozinhos (um "ok" só vale para o código que foi testado).
# Códigos de saída: 0 tudo verde · 1 há falhas · 2 ainda faltam testes (rode de novo).
cd "$(dirname "$0")" || exit 1
export RH_ROOT="${RH_ROOT:-../current}"
LOGS="${RH_LOGS:-../logs}"; mkdir -p "$LOGS"
J=2; ORC=540; RESET=0; FILTROS=()
while [ $# -gt 0 ]; do
  case "$1" in
    -j) J="$2"; shift 2;;
    --orcamento) ORC="$2"; shift 2;;
    --reset) RESET=1; shift;;
    *) FILTROS+=("$1"); shift;;
  esac
done
HASH=$(cd .. && find current tests -type f ! -path '*/node_modules/*' ! -name '*.log' -print0 | sort -z | xargs -0 sha1sum | sha1sum | cut -c1-40)
if [ "$RESET" = 1 ] || [ "$(cat "$LOGS/.hash" 2>/dev/null)" != "$HASH" ]; then rm -f "$LOGS"/*.ok "$LOGS"/*.fail "$LOGS"/*.log "$LOGS"/*.log1; fi
echo "$HASH" > "$LOGS/.hash"
export LOGS; export PRAZO=$(( ORC > 0 ? $(date +%s) + ORC : 0 ))
rodar() {
  f="$1"; b="${f%.test.mjs}"
  [ -f "$LOGS/$b.ok" ] && return 0
  rm -f "$LOGS/$b.fail"
  if [ "$PRAZO" -gt 0 ] && [ "$(date +%s)" -ge "$PRAZO" ]; then return 0; fi
  if timeout 900 node --test "$f" > "$LOGS/$b.log" 2>&1; then touch "$LOGS/$b.ok"; echo "  ok    $b"
  else
    # uma segunda tentativa isolada separa falha de verdade de oscilação por carga (a 1ª falha fica registrada em .log1)
    cp "$LOGS/$b.log" "$LOGS/$b.log1"
    if timeout 900 node --test "$f" > "$LOGS/$b.log" 2>&1; then touch "$LOGS/$b.ok"; echo "  ok    $b (passou só na 2ª tentativa: oscilação; ver $b.log1)"; else touch "$LOGS/$b.fail"; echo "  FALHOU $b"; fi
  fi
}
export -f rodar
LISTA=()
for f in [0-9][0-9]-*.test.mjs; do
  if [ ${#FILTROS[@]} -gt 0 ]; then casa=0; for p in "${FILTROS[@]}"; do [[ "$f" == *"$p"* ]] && casa=1; done; [ $casa = 1 ] || continue; fi
  LISTA+=("$f")
done
printf '%s\n' "${LISTA[@]}" | xargs -P "$J" -I{} bash -c 'rodar {}'
OK=0; FAIL=0; FALTA=0
for f in "${LISTA[@]}"; do b="${f%.test.mjs}"; if [ -f "$LOGS/$b.ok" ]; then OK=$((OK+1)); elif [ -f "$LOGS/$b.fail" ]; then FAIL=$((FAIL+1)); else FALTA=$((FALTA+1)); fi; done
echo "== $OK ok · $FAIL falharam · $FALTA faltam (de ${#LISTA[@]})"
for f in "${LISTA[@]}"; do b="${f%.test.mjs}"; if [ -f "$LOGS/$b.fail" ]; then echo "-- $b"; grep -m3 -E "^not ok|error:|Error" "$LOGS/$b.log" | cut -c1-200; fi; done
[ "$FAIL" -gt 0 ] && exit 1
[ "$FALTA" -gt 0 ] && { echo "Faltam testes: rode o mesmo comando de novo para continuar."; exit 2; }
exit 0
