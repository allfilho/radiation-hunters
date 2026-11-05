# Criar o repositório e ligar ao Netlify

Nome sugerido do repositório: `radiation-hunters` (igual ao do site radiationhunters.netlify.app). Visibilidade: Private por enquanto.
Rode os comandos DIRETO no Terminal do Mac, não pela ponte do Cowork (o Git falha no volume externo por lá). Faça isto só depois de a v3.27.1 estar aplicada na pasta.

## 1. Preparar o Git no Mac (uma vez)
```bash
git --version                                   # se não existir, o Mac oferece instalar as ferramentas de linha de comando
git config --global user.name "Seu Nome"
git config --global user.email "allfilho@unicamp.br"   # use o e-mail da conta do GitHub
brew install gh && gh auth login                # opcional, mas é o jeito mais simples de autenticar (escolha HTTPS e o navegador)
```

## 2. Criar o repositório vazio no GitHub
github.com → botão **New** → Repository name: `radiation-hunters` → **Private** → NÃO marque README, .gitignore nem licença → Create repository.
(Com o `gh`: `gh repo create radiation-hunters --private --source=. --remote=origin` no passo 3 faz esta etapa sozinho.)

## 3. Primeiro commit e envio
```bash
cd /Volumes/EXBOM/LabVirtualGC/apps/radhunter
git init -b main
git add .gitignore netlify.toml README.md current tests docs
git status                                      # confira: nada de archive/, node_modules/ nem .tgz
git commit -m "Radiation Hunters v3.27.1: primeiro commit"
git remote add origin https://github.com/allfilho/radiation-hunters.git
git push -u origin main
git tag v3.27.1 && git push --tags
git switch -c desenvolvimento && git push -u origin desenvolvimento
```
Troque allfilho pelo seu nome de usuário (ou organização) no GitHub.

## 4. Ligar ao Netlify (site que já existe)
1. app.netlify.com → site `radiationhunters` → Site configuration → Build & deploy → Continuous deployment → **Link repository** (ou "Link site to Git").
2. Escolha GitHub, autorize o Netlify e selecione `radiation-hunters`.
3. Production branch: `main`. Build command: vazio. Publish directory: `current`. (O `netlify.toml` já diz isso.)
4. Em Branches/Deploy contexts: deixe **branch deploys desligado** (ou só `main`), para a branch `desenvolvimento` não publicar.
5. Depois de ligado, **cada push na `main` publica o site**.

## 5. Rotina de cada versão
```bash
git switch desenvolvimento                      # trabalhar e testar aqui
git add -A && git commit -m "vX.Y.Z: o que mudou"
git switch main && git merge desenvolvimento    # só quando aprovar: isto publica
git tag vX.Y.Z && git push && git push --tags
git switch desenvolvimento
```
Voltar a uma versão anterior: `git switch --detach vX.Y.Z` para olhar; para republicar uma versão antiga, `git revert` do commit problemático na `main`.
