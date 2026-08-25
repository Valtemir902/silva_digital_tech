import os
import shutil
import subprocess
import unicodedata
from pathlib import Path

def executar_comando(comando):
    """Executa comandos no terminal e para o script se der erro."""
    try:
        subprocess.run(comando, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"\n[ERRO CRÍTICO] Falha na execução do Git. Verifique o terminal: {e}")
        exit(1)

def gerar_slug(texto):
    """Remove acentos, ç, e caracteres especiais de forma profissional para URLs."""
    # Troca letras acentuadas por suas versões normais (ex: á -> a, ç -> c)
    texto_limpo = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    slug = texto_limpo.lower().replace(" ", "-")
    # Remove qualquer coisa que não seja letra, número ou hífen
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    # Remove hifens duplicados
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")

def main():
    print("=" * 70)
    print("   SILVA DIGITAL TECH - ENGENHARIA DE IMPLANTAÇÃO AUTOMATIZADA")
    print("=" * 70 + "\n")

    print("Selecione a operação:")
    print("1 - [NOVO] Publicar Aplicativo Web (Pasta HTML/JS/CSS)")
    print("2 - [NOVO] Publicar Software Windows (Arquivo .exe)")
    print("3 - [ATUALIZAR] Aplicativo Web existente")
    print("4 - [ATUALIZAR] Software Windows existente (.exe)")
    
    opcao = input("\nDigite a opção (1, 2, 3 ou 4): ").strip()
    
    if opcao not in ["1", "2", "3", "4"]:
        print("Opção inválida! Encerrando script.")
        return

    is_update = opcao in ["3", "4"]
    is_web = opcao in ["1", "3"]

    base_dir = Path("novo_site")
    if not base_dir.exists():
        print("ERRO FATAL: O script deve ser rodado na mesma pasta onde fica 'novo_site'.")
        return

    # ==========================================
    # FLUXO 1: ATUALIZAR ITEM EXISTENTE
    # ==========================================
    if is_update:
        pasta_alvo = base_dir / "public" / "apps" if is_web else base_dir / "public" / "downloads"
        if not pasta_alvo.exists():
            print("Diretório alvo não encontrado.")
            return
            
        # Lista pastas (se for web) ou arquivos .exe (se for software)
        itens = [p.name for p in pasta_alvo.iterdir() if (p.is_dir() if is_web else p.suffix == ".exe")]
        
        if not itens:
            print("Não há nenhum sistema cadastrado para atualizar.")
            return

        print("\nSistemas atualmente em produção:")
        for i, item in enumerate(itens, 1):
            print(f"[{i}] {item}")
            
        escolha = input("\nQual número você quer atualizar? ").strip()
        try:
            alvo_nome = itens[int(escolha) - 1]
            slug = alvo_nome.replace(".exe", "")
        except (ValueError, IndexError):
            print("Escolha inválida!")
            return
            
        print(f"\n=> Preparando atualização para: {slug}")

    # ==========================================
    # FLUXO 2: CRIAR NOVO ITEM
    # ==========================================
    else:
        titulo = input("\nNome oficial do Sistema (ex: Gerador de Orçamentos): ").strip()
        if not titulo:
            print("Erro: O nome é obrigatório!")
            return

        slug = gerar_slug(titulo)
        tag = input("Tag (ex: FERRAMENTA GRATUITA, WINDOWS APP, IA): ").strip().upper()
        descricao = input("Descrição curta de SEO para a vitrine: ").strip()

    # ==========================================
    # PROCESSAMENTO DE ARQUIVOS (CÓPIA)
    # ==========================================
    if is_web:
        origem = input(f"Caminho da pasta do app web: ").strip('"\'')
        if not os.path.exists(origem):
            print("ERRO: A pasta de origem não existe.")
            return
        
        destino_app = base_dir / "public" / "apps" / slug
        print(f"\n[1/4] Substituindo arquivos no servidor em: {destino_app}...")
        if destino_app.exists():
            shutil.rmtree(destino_app)
        shutil.copytree(origem, destino_app)
        
        link = f"/apps/{slug}/"
        icone = f"/apps/{slug}/favicon.png"
    else:
        origem = input(f"Caminho do arquivo .exe: ").strip('"\'')
        if not os.path.exists(origem) or not origem.endswith(".exe"):
            print("ERRO: Arquivo .exe não encontrado.")
            return
        
        destino_downloads = base_dir / "public" / "downloads"
        destino_downloads.mkdir(parents=True, exist_ok=True)
        
        # Na atualização, preserva o nome original do .exe para não quebrar links antigos!
        nome_exe = alvo_nome if is_update else Path(origem).name
        destino_final = destino_downloads / nome_exe
        
        print(f"\n[1/4] Transferindo software para: {destino_final}...")
        shutil.copy(origem, destino_final)
        
        link = f"/downloads/{nome_exe}"
        icone = "/assets/icons/windows.png"

    # ==========================================
    # GERAÇÃO DO BANCO DE DADOS (VITRINE)
    # ==========================================
    if not is_update:
        pasta_conteudo = base_dir / "content" / "apps"
        pasta_conteudo.mkdir(parents=True, exist_ok=True)
        arquivo_md = pasta_conteudo / f"{slug}.md"
        
        conteudo_md = f'---\ntitle: "{titulo}"\ntag: "{tag}"\nlink: "{link}"\nicone: "{icone}"\ndescricao: "{descricao}"\n---\n'
        print(f"\n[2/4] Integrando sistema na Vitrine (SEO Automatizado)...")
        with open(arquivo_md, "w", encoding="utf-8") as f:
            f.write(conteudo_md)
    else:
        print(f"\n[2/4] Registros de SEO mantidos intactos.")

    # ==========================================
    # DEPLOY AUTOMÁTICO (GITHUB -> NETLIFY)
    # ==========================================
    print("\n[3/4] Sincronizando infraestrutura com a nuvem (Git Add)...")
    executar_comando("git add .")

    tipo_txt = 'Web App' if is_web else 'Windows .exe'
    acao_txt = "Atualização" if is_update else "Deploy de Novo Sistema"
    msg_commit = f"{acao_txt}: {slug} ({tipo_txt})"
    
    print(f"\n[4/4] Fechando pacote (Commit) e enviando para o Data Center (Push)...")
    executar_comando(f'git commit -m "{msg_commit}"')
    executar_comando("git push origin main")

    print("\n" + "=" * 70)
    print("   OPERAÇÃO CONCLUÍDA COM EXCELÊNCIA MILITAR!   ")
    print("=" * 70)
    print(f"👉 Sistema: {slug}")
    print(f"👉 URL Oficial: https://silvadigitaltech.com{link}")
    print("A Netlify já está compilando em segundo plano e colocará no ar em ~30 segundos.")

if __name__ == "__main__":
    main()