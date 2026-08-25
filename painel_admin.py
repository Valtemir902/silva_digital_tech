import os
import shutil
import subprocess
import unicodedata
import threading
import re # NOVO: Motor de expressões regulares para SEO
from datetime import datetime
import customtkinter as ctk
from tkinter import filedialog, messagebox
from pathlib import Path
import sys

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class SilvaDigitalTechAdmin(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Silva Digital Tech - Control Center PRO V4 (SEO Automático)")
        self.geometry("1100x950")
        
        if getattr(sys, 'frozen', False):
            caminho_base_sistema = Path(sys.executable).parent
        else:
            caminho_base_sistema = Path(__file__).parent

        self.base_dir = caminho_base_sistema / "novo_site"

        self.caminho_app_novo = ""
        self.caminho_icone_novo = ""
        self.caminho_app_edit = ""
        self.blocos_pagina = [] 

        self.header = ctk.CTkLabel(self, text="SILVA DIGITAL TECH - CONTROL CENTER PRO", font=("Roboto", 24, "bold"), text_color="#00a8ff")
        self.header.pack(pady=(15, 0))
        self.subheader = ctk.CTkLabel(self, text="Construtor Visual de Páginas de Elite & Automação de Servidores (SEO)", font=("Roboto", 14), text_color="gray")
        self.subheader.pack(pady=(0, 15))

        self.btn_sync = ctk.CTkButton(self, text="📥 SINCRONIZAR COM A NUVEM", fg_color="#005580", hover_color="#00334d", command=self.iniciar_sync_nuvem)
        self.btn_sync.pack(pady=(0, 10))

        # ANCORAMOS O LOG NO FUNDO
        self.log_console = ctk.CTkTextbox(self, height=180, state="disabled", fg_color="#0d0d0d", text_color="#00ff00", font=("Consolas", 13))
        self.log_console.pack(side="bottom", fill="x", padx=20, pady=(10, 20))

        # ABAS DO SISTEMA
        self.tabview = ctk.CTkTabview(self, width=1050, height=600)
        self.tabview.pack(padx=20, pady=5, fill="both", expand=True)
        
        self.tab_builder = self.tabview.add("🏗️ Page Builder Profissional")
        self.tab_novo = self.tabview.add("🚀 Lançar Novo App")
        self.tab_edit = self.tabview.add("🔄 Atualizar App")
        self.tab_blog = self.tabview.add("📝 Escrever Blog")

        self.setup_tab_builder()
        self.setup_tab_novo()
        self.setup_tab_edit()
        self.setup_tab_blog()
        
        if not self.base_dir.exists():
            self.log("ERRO CRÍTICO: Pasta 'novo_site' não encontrada!")
        else:
            self.log("Control Center V4 Pro (SEO Engine) inicializado com sucesso.")
            self.carregar_apps_existentes()

    # FUNÇÃO DE LOG ANTI-CONGELAMENTO
    def log(self, mensagem):
        def _atualizar_tela():
            self.log_console.configure(state="normal")
            agora = datetime.now().strftime("%H:%M:%S")
            self.log_console.insert("end", f"[{agora}] {mensagem}\n")
            self.log_console.see("end")
            self.log_console.configure(state="disabled")
        self.after(0, _atualizar_tela)

    def gerar_slug(self, texto):
        texto_limpo = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
        slug = "".join(c if c.isalnum() else "-" for c in texto_limpo.lower())
        while "--" in slug: slug = slug.replace("--", "-")
        return slug.strip("-")

    # ==========================================================
    # 🌟 MOTOR DE SEO ULTRA AVANÇADO (INJEÇÃO NO SITEMAP.XML)
    # ==========================================================
    def atualizar_sitemap(self, path, priority="0.8", changefreq="monthly"):
        sitemap_path = self.base_dir / "public" / "sitemap.xml"
        if not sitemap_path.exists():
            self.log("⚠️ Aviso: sitemap.xml não encontrado na pasta public.")
            return

        try:
            full_url = f"https://silvadigitaltech.com{path}"
            hoje = datetime.now().strftime("%Y-%m-%d")
            
            with open(sitemap_path, "r", encoding="utf-8") as f:
                conteudo = f.read()
                
            if full_url in conteudo:
                # Atualiza apenas a data se a URL já existir (Impede duplicatas)
                padrao = rf"(<loc>\s*{re.escape(full_url)}\s*</loc>\s*<lastmod>)[^<]+(</lastmod>)"
                conteudo = re.sub(padrao, rf"\g<1>{hoje}\g<2>", conteudo)
                self.log(f"SEO: Data atualizada no sitemap para a URL já existente: {path}")
            else:
                # Injeta a nova URL antes de fechar a tag </urlset>
                novo_bloco = f"""
  <!-- Auto-gerado via Control Center PRO -->
  <url>
    <loc>{full_url}</loc>
    <lastmod>{hoje}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>
</urlset>"""
                if "</urlset>" in conteudo:
                    conteudo = conteudo.replace("</urlset>", novo_bloco)
                    self.log(f"SEO Elite: Nova URL injetada no Sitemap automaticamente -> {path}")
                else:
                    self.log("⚠️ Aviso: Tag </urlset> não encontrada no sitemap.xml. Não foi possível injetar.")
                    return

            with open(sitemap_path, "w", encoding="utf-8") as f:
                f.write(conteudo)
                
        except Exception as e:
            self.log(f"❌ ERRO AO ATUALIZAR SITEMAP: {str(e)}")

    # ==========================================================
    # ROTINAS DE NUVEM / GITHUB
    # ==========================================================
    def iniciar_sync_nuvem(self):
        threading.Thread(target=self.executar_git_pull).start()

    def executar_git_pull(self):
        try:
            self.log("Baixando dados da nuvem (Git Pull)...")
            subprocess.run("git pull origin main", check=True, shell=True, capture_output=True, cwd=str(self.base_dir))
            self.log("✅ Sincronizado com sucesso!")
            self.carregar_apps_existentes()
        except subprocess.CalledProcessError:
            self.log("❌ ERRO NO PULL. Verifique conflitos.")

    def executar_git_background(self, mensagem_commit):
        try:
            self.log("Preparando pacote completo para os servidores (git add -A)...")
            # O parâmetro -A garante que absolutamente todos os arquivos (incluindo package.json e novos .md) sejam capturados
            subprocess.run("git add -A", check=True, shell=True, capture_output=True, cwd=str(self.base_dir))
            
            self.log(f"Fechando commit: '{mensagem_commit}'...")
            subprocess.run(f'git commit -m "{mensagem_commit}"', check=True, shell=True, capture_output=True, cwd=str(self.base_dir))
            
            self.log("Enviando para a Netlify (Push)...")
            subprocess.run("git push origin main", check=True, shell=True, capture_output=True, cwd=str(self.base_dir))
            
            self.log("✅ DEPLOY CONCLUÍDO! Página e arquivos sincronizados com sucesso.")
            messagebox.showinfo("Sucesso", "Sistema, SEO e dependências enviados para os servidores com excelência!")
        except subprocess.CalledProcessError as e:
            self.log(f"❌ ERRO NO DEPLOY. Falha ao enviar para o GitHub. Detalhes: {e}")

    # TAB 1: PAGE BUILDER PROFISSIONAL
    def setup_tab_builder(self):
        topo = ctk.CTkFrame(self.tab_builder, fg_color="transparent")
        topo.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(topo, text="Nome da URL da Página (ex: produtos, oferta-especial):", font=("Roboto", 12, "bold")).pack(side="left", padx=5)
        self.builder_slug = ctk.CTkEntry(topo, width=300, placeholder_text="minha-pagina")
        self.builder_slug.pack(side="left", padx=5)

        menu = ctk.CTkFrame(self.tab_builder)
        menu.pack(fill="x", padx=10, pady=10)
        
        self.tipo_bloco = ctk.CTkOptionMenu(menu, width=300, values=[
            "Hero de Elite (Cabeçalho com Gradiente)", 
            "Banner / Imagem Clicável (Anúncio)", 
            "Grid de Cards de Destaque", 
            "Área de Anúncios / Código HTML",
            "Texto Rico / Artigo",
            "Rodapé Institucional"
        ])
        self.tipo_bloco.pack(side="left", padx=10, pady=10)
        
        ctk.CTkButton(menu, text="➕ ADICIONAR BLOCO À PÁGINA", fg_color="#0066cc", hover_color="#004c99", command=self.adicionar_bloco_ui).pack(side="left", padx=10, pady=10)

        self.canvas_builder = ctk.CTkScrollableFrame(self.tab_builder, fg_color="#141414", border_width=1, border_color="#333")
        self.canvas_builder.pack(fill="both", expand=True, padx=10, pady=5)

        ctk.CTkButton(self.tab_builder, text="🚀 COMPILAR ASTRO & PUBLICAR (Com SEO)", fg_color="#008000", hover_color="#006400", font=("Roboto", 14, "bold"), height=50, command=self.gerar_pagina_astro).pack(fill="x", padx=10, pady=10)

    def selecionar_imagem_para_campo(self, entry_destino):
        caminho = filedialog.askopenfilename(title="Selecione a Imagem", filetypes=[("Imagens", "*.png *.jpg *.jpeg *.webp *.svg")])
        if caminho:
            pasta_upload = self.base_dir / "public" / "assets" / "uploads"
            pasta_upload.mkdir(parents=True, exist_ok=True)
            nome_arq = Path(caminho).name
            destino = pasta_upload / nome_arq
            shutil.copy(caminho, destino)
            
            caminho_web = f"/assets/uploads/{nome_arq}"
            entry_destino.delete(0, "end")
            entry_destino.insert(0, caminho_web)
            self.log(f"Imagem enviada com sucesso: {nome_arq}")

    def adicionar_bloco_ui(self):
        tipo = self.tipo_bloco.get()
        bid = len(self.blocos_pagina)
        
        frame = ctk.CTkFrame(self.canvas_builder, fg_color="#1f1f1f", border_width=1, border_color="#444")
        frame.pack(fill="x", padx=5, pady=10)
        
        ctk.CTkLabel(frame, text=f"Bloco #{bid + 1} — {tipo}", font=("Roboto", 13, "bold"), text_color="#00a8ff").pack(anchor="w", padx=10, pady=5)
        
        campos = {}
        if "Hero de Elite" in tipo:
            ctk.CTkLabel(frame, text="Título Principal:").pack(anchor="w", padx=10)
            t = ctk.CTkEntry(frame, width=650); t.pack(anchor="w", padx=10, pady=2)
            ctk.CTkLabel(frame, text="Subtítulo Descritivo:").pack(anchor="w", padx=10)
            s = ctk.CTkEntry(frame, width=650); s.pack(anchor="w", padx=10, pady=2)
            ctk.CTkLabel(frame, text="Texto do Botão | Link do Botão:").pack(anchor="w", padx=10)
            linha = ctk.CTkFrame(frame, fg_color="transparent")
            linha.pack(fill="x", padx=10, pady=2)
            bt = ctk.CTkEntry(linha, width=310, placeholder_text="Ex: Baixar Agora"); bt.pack(side="left", padx=(0,10))
            bl = ctk.CTkEntry(linha, width=330, placeholder_text="Ex: https://..."); bl.pack(side="left")
            campos = {"t": t, "s": s, "bt": bt, "bl": bl}
        elif "Banner / Imagem Clicável" in tipo:
            ctk.CTkLabel(frame, text="Caminho da Imagem (Use o botão ao lado para enviar do PC):").pack(anchor="w", padx=10)
            linha_img = ctk.CTkFrame(frame, fg_color="transparent")
            linha_img.pack(fill="x", padx=10, pady=2)
            img = ctk.CTkEntry(linha_img, width=500); img.pack(side="left", padx=(0,10))
            btn_img = ctk.CTkButton(linha_img, text="📁 Enviar do PC", width=140, fg_color="#444", command=lambda: self.selecionar_imagem_para_campo(img))
            btn_img.pack(side="left")
            ctk.CTkLabel(frame, text="Link de Destino ao Clicar na Imagem:").pack(anchor="w", padx=10)
            lnk = ctk.CTkEntry(frame, width=650, placeholder_text="Ex: https://wa.me/..."); lnk.pack(anchor="w", padx=10, pady=2)
            campos = {"img": img, "lnk": lnk}
        elif "Grid de Cards" in tipo:
            ctk.CTkLabel(frame, text="Título da Seção de Cards:").pack(anchor="w", padx=10)
            st = ctk.CTkEntry(frame, width=650); st.pack(anchor="w", padx=10, pady=2)
            ctk.CTkLabel(frame, text="Card 1 (Título | Descrição | Link):").pack(anchor="w", padx=10)
            c1_t = ctk.CTkEntry(frame, width=200, placeholder_text="Título 1")
            c1_d = ctk.CTkEntry(frame, width=300, placeholder_text="Descrição 1")
            c1_l = ctk.CTkEntry(frame, width=130, placeholder_text="Link 1")
            l1 = ctk.CTkFrame(frame, fg_color="transparent"); l1.pack(fill="x", padx=10, pady=2)
            for w in [c1_t, c1_d, c1_l]: w.pack(side="left", padx=2)
            ctk.CTkLabel(frame, text="Card 2 (Título | Descrição | Link):").pack(anchor="w", padx=10)
            c2_t = ctk.CTkEntry(frame, width=200, placeholder_text="Título 2")
            c2_d = ctk.CTkEntry(frame, width=300, placeholder_text="Descrição 2")
            c2_l = ctk.CTkEntry(frame, width=130, placeholder_text="Link 2")
            l2 = ctk.CTkFrame(frame, fg_color="transparent"); l2.pack(fill="x", padx=10, pady=2)
            for w in [c2_t, c2_d, c2_l]: w.pack(side="left", padx=2)
            campos = {"st": st, "c1_t": c1_t, "c1_d": c1_d, "c1_l": c1_l, "c2_t": c2_t, "c2_d": c2_d, "c2_l": c2_l}
        elif "Área de Anúncios" in tipo:
            ctk.CTkLabel(frame, text="Código HTML / Script do Anúncio (Ex: Google AdSense ou Banner HTML):").pack(anchor="w", padx=10)
            html_code = ctk.CTkTextbox(frame, width=650, height=80)
            html_code.pack(anchor="w", padx=10, pady=5)
            campos = {"html_code": html_code}
        elif "Texto Rico" in tipo:
            ctk.CTkLabel(frame, text="Parágrafo / Conteúdo do Texto:").pack(anchor="w", padx=10)
            txt = ctk.CTkTextbox(frame, width=650, height=100)
            txt.pack(anchor="w", padx=10, pady=5)
            campos = {"txt": txt}
        elif "Rodapé" in tipo:
            ctk.CTkLabel(frame, text="Texto do Copyright / Rodapé:").pack(anchor="w", padx=10)
            ft = ctk.CTkEntry(frame, width=650); ft.insert(0, "© 2026 Silva Digital Tech. Todos os direitos reservados.")
            ft.pack(anchor="w", padx=10, pady=5)
            campos = {"ft": ft}
        self.blocos_pagina.append({"tipo": tipo, "frame": frame, "campos": campos})
        self.log(f"Bloco corporativo adicionado: {tipo}")

    def gerar_pagina_astro(self):
        slug = self.gerar_slug(self.builder_slug.get().strip())
        if not slug: return messagebox.showwarning("Aviso", "Digite o nome da URL no topo!")
        if not self.blocos_pagina: return messagebox.showwarning("Aviso", "Adicione blocos à página!")
        self.log(f"Gerando código Astro de alta performance para /{slug}...")
        codigo = f"""---
import '../styles/global.css';
---
<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{slug.replace('-', ' ').title()} | Silva Digital Tech</title>
<script src="https://cdn.tailwindcss.com" is:inline></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
<nav class="w-full py-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="/" class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Silva Digital Tech
        </a>
        <a href="/" class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Voltar ao Início
        </a>
    </div>
</nav>
<main class="flex-grow max-w-7xl mx-auto w-full px-6 py-16 flex flex-col gap-20">
"""
        for b in self.blocos_pagina:
            t = b["tipo"]
            c = b["campos"]
            if "Hero de Elite" in t:
                tit = c["t"].get().strip()
                sub = c["s"].get().strip()
                bt = c["bt"].get().strip()
                bl = c["bl"].get().strip()
                btn_html = f'<a href="{bl}" class="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 transition-all">{bt} &rarr;</a>' if bt and bl else ""
                codigo += f"""
    <section class="text-center py-20 relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-900/40 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">{tit}</h1>
        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">{sub}</p>
        {btn_html}
    </section>
"""
            elif "Banner / Imagem Clicável" in t:
                img = c["img"].get().strip()
                lnk = c["lnk"].get().strip()
                codigo += f"""
    <section class="w-full group">
        <a href="{lnk}" target="_blank" class="block rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,120,255,0.15)] border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-500 bg-slate-900/60">
            <img src="{img}" class="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700" alt="Banner Publicitário">
        </a>
    </section>
"""
            elif "Grid de Cards" in t:
                st = c["st"].get().strip()
                c1t, c1d, c1l = c["c1_t"].get().strip(), c["c1_d"].get().strip(), c["c1_l"].get().strip()
                c2t, c2d, c2l = c["c2_t"].get().strip(), c["c2_d"].get().strip(), c["c2_l"].get().strip()
                codigo += f"""
    <section>
        <h2 class="text-3xl font-extrabold text-white mb-10 text-center">{st}</h2>
        <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500">
                <div>
                    <h3 class="text-2xl font-bold text-white mb-3">{c1t}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed mb-6">{c1d}</p>
                </div>
                <a href="{c1l}" class="text-emerald-400 font-semibold text-sm hover:text-emerald-300 transition-colors w-max">Acessar &rarr;</a>
            </div>
            <div class="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500">
                <div>
                    <h3 class="text-2xl font-bold text-white mb-3">{c2t}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed mb-6">{c2d}</p>
                </div>
                <a href="{c2l}" class="text-cyan-400 font-semibold text-sm hover:text-cyan-300 transition-colors w-max">Acessar &rarr;</a>
            </div>
        </div>
    </section>
"""
            elif "Área de Anúncios" in t:
                html_code = c["html_code"].get("1.0", "end-1c").strip()
                codigo += f"""
    <section class="w-full flex justify-center my-6">
        <div class="w-full max-w-4xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex justify-center items-center overflow-hidden">
            {html_code}
        </div>
    </section>
"""
            elif "Texto Rico" in t:
                txt = c["txt"].get("1.0", "end-1c").strip().replace('\n', '<br>')
                codigo += f"""
    <section class="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 text-slate-300 leading-relaxed text-lg shadow-xl">
        {txt}
    </section>
"""
            elif "Rodapé" in t:
                ft = c["ft"].get().strip()
                codigo += f"""
    <footer class="py-12 text-center text-slate-500 border-t border-slate-800/60 mt-auto">
        <p class="font-medium">{ft}</p>
        <p class="mt-2 text-sm text-slate-600 flex items-center justify-center gap-2">
            <i class="fa-solid fa-shield-check"></i> Powered by Silva Digital Tech Engine
        </p>
    </footer>
"""
        codigo += """
</main>
</body>
</html>
"""
        pasta_pages = self.base_dir / "src" / "pages"
        pasta_pages.mkdir(parents=True, exist_ok=True)
        caminho = pasta_pages / f"{slug}.astro"
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(codigo)
        self.log(f"Página profissional compilada: {slug}.astro")
        
        # CHAMA O MOTOR DE SEO AUTOMÁTICO
        self.atualizar_sitemap(f"/{slug}/", priority="0.9", changefreq="weekly")
        
        threading.Thread(target=self.executar_git_background, args=(f"Page Builder Pro: {slug} (+SEO)",)).start()
        for b in self.blocos_pagina: b["frame"].destroy()
        self.blocos_pagina.clear()

    # TAB 2: LANÇAR NOVO APP
    def setup_tab_novo(self):
        scroll = ctk.CTkScrollableFrame(self.tab_novo, fg_color="transparent")
        scroll.pack(fill="both", expand=True)

        ctk.CTkLabel(scroll, text="Título Oficial:").grid(row=0, column=0, padx=10, pady=(10,5), sticky="w")
        self.novo_titulo = ctk.CTkEntry(scroll, width=500)
        self.novo_titulo.grid(row=0, column=1, padx=10, pady=(10,5), sticky="w")

        ctk.CTkLabel(scroll, text="Categoria:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.novo_categoria = ctk.CTkOptionMenu(scroll, width=300, values=["Aplicativos Mobile", "Softwares & Automações", "Soluções Web & Sites"])
        self.novo_categoria.grid(row=1, column=1, padx=10, pady=5, sticky="w")

        ctk.CTkLabel(scroll, text="Tag/Selo:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.novo_tag = ctk.CTkEntry(scroll, width=500)
        self.novo_tag.grid(row=2, column=1, padx=10, pady=5, sticky="w")

        ctk.CTkLabel(scroll, text="Formato:").grid(row=3, column=0, padx=10, pady=5, sticky="w")
        self.novo_tipo = ctk.CTkOptionMenu(scroll, width=300, values=["Web App (Pasta HTML/JS/CSS)", "Software Windows (.exe)", "Aplicativo Android (.apk)", "Link Externo (Play Store/Web)"])
        self.novo_tipo.grid(row=3, column=1, padx=10, pady=5, sticky="w")

        self.btn_novo_caminho = ctk.CTkButton(scroll, text="📁 Selecionar Arquivo/Pasta", command=self.selecionar_app_novo)
        self.btn_novo_caminho.grid(row=4, column=0, padx=10, pady=10, sticky="w")
        self.lbl_novo_caminho = ctk.CTkLabel(scroll, text="Aguardando seleção...", text_color="gray")
        self.lbl_novo_caminho.grid(row=4, column=1, padx=10, pady=10, sticky="w")

        self.btn_novo_icone = ctk.CTkButton(scroll, text="🖼️ Selecionar Logomarca", fg_color="#4d4d4d", command=self.selecionar_icone_novo)
        self.btn_novo_icone.grid(row=5, column=0, padx=10, pady=10, sticky="w")
        self.lbl_novo_icone = ctk.CTkLabel(scroll, text="Usar ícone padrão", text_color="gray")
        self.lbl_novo_icone.grid(row=5, column=1, padx=10, pady=10, sticky="w")

        ctk.CTkLabel(scroll, text="Descrição SEO:").grid(row=6, column=0, padx=10, pady=5, sticky="nw")
        self.novo_desc = ctk.CTkTextbox(scroll, width=500, height=80)
        self.novo_desc.grid(row=6, column=1, padx=10, pady=5, sticky="w")

        self.btn_publicar_novo = ctk.CTkButton(scroll, text="🚀 PUBLICAR SISTEMA", fg_color="#008000", font=("Roboto", 14, "bold"), height=45, command=self.processar_novo_app)
        self.btn_publicar_novo.grid(row=7, column=0, columnspan=2, pady=20)

    def selecionar_app_novo(self):
        t = self.novo_tipo.get()
        caminho = filedialog.askdirectory() if "Pasta" in t else filedialog.askopenfilename() if ".exe" in t or ".apk" in t else ctk.CTkInputDialog(text="Cole o Link:", title="Link").get_input()
        if caminho:
            self.caminho_app_novo = caminho
            self.lbl_novo_caminho.configure(text=caminho[:55] + "...", text_color="white")

    def selecionar_icone_novo(self):
        c = filedialog.askopenfilename()
        if c:
            self.caminho_icone_novo = c
            self.lbl_novo_icone.configure(text=c[:55] + "...", text_color="#00a8ff")

    def processar_novo_app(self):
        try:
            titulo = self.novo_titulo.get().strip()
            if not titulo: 
                return messagebox.showwarning("Aviso", "O Título Oficial é obrigatório!")

            self.log(f"Iniciando empacotamento do app: '{titulo}'...")
            slug = self.gerar_slug(titulo)
            t = self.novo_tipo.get()
            
            if not self.caminho_app_novo:
                if "Link" not in t:
                    self.log("❌ ERRO: Nenhuma pasta ou arquivo foi selecionado.")
                    return messagebox.showwarning("Aviso", "Selecione a pasta ou arquivo do app!")
            
            origem = Path(self.caminho_app_novo) if self.caminho_app_novo else None
            link_final = ""
            icone_final = ""
            
            if self.caminho_icone_novo:
                self.log("Processando logomarca de elite...")
                pasta_i = self.base_dir / "public" / "assets" / "icons"
                pasta_i.mkdir(parents=True, exist_ok=True)
                nome_i = f"{slug}_icon{Path(self.caminho_icone_novo).suffix}"
                shutil.copy(self.caminho_icone_novo, pasta_i / nome_i)
                icone_final = f"/assets/icons/{nome_i}"
            else:
                icone_final = "/assets/icons/windows.png" if ".exe" in t else "/assets/icons/android.png" if ".apk" in t else "/assets/icons/link.png"

            self.log(f"Injetando sistema no formato: {t}...")
            if "Link" in t: 
                link_final = self.caminho_app_novo
            elif "Pasta" in t:
                d = self.base_dir / "public" / "apps" / slug
                if d.exists(): shutil.rmtree(d)
                shutil.copytree(origem, d, dirs_exist_ok=True)
                link_final = f"/apps/{slug}/"
            else:
                d = self.base_dir / "public" / "downloads"
                d.mkdir(parents=True, exist_ok=True)
                shutil.copy(origem, d / origem.name)
                link_final = f"/downloads/{origem.name}"

            self.log("Aplicando regras de SEO avançado e metadados no Card...")
            p_cont = self.base_dir / "src" / "content" / "aplicativos"
            p_cont.mkdir(parents=True, exist_ok=True)
            desc_limpa = self.novo_desc.get("1.0", "end-1c").strip().replace('"', "'").replace('\n', ' ')
            
            conteudo_md = f"""---
title: "{titulo}"
categoria: "{self.novo_categoria.get()}"
tag: "{self.novo_tag.get()}"
link: "{link_final}"
icone: "{icone_final}"
descricao: "{desc_limpa}"
---
"""
            with open(p_cont / f"{slug}.md", "w", encoding="utf-8") as f:
                f.write(conteudo_md)

            self.log("✅ App Web integrado ao painel principal (Card renderizado)!")
            
            # CHAMA O MOTOR DE SEO AUTOMÁTICO PARA A PÁGINA DO APP
            if "Pasta" in t:
                self.atualizar_sitemap(link_final, priority="0.8", changefreq="monthly")
            
            self.novo_titulo.delete(0, 'end')
            self.novo_tag.delete(0, 'end')
            self.novo_desc.delete("1.0", 'end')
            self.caminho_app_novo = ""
            self.caminho_icone_novo = ""
            self.lbl_novo_caminho.configure(text="Aguardando seleção...")
            self.lbl_novo_icone.configure(text="Usar ícone padrão")
            
            threading.Thread(target=self.executar_git_background, args=(f"🚀 Lançamento App: {titulo} (+SEO)",)).start()

        except Exception as e:
            self.log(f"❌ ERRO CRÍTICO NO NOVO APP: {str(e)}")
            messagebox.showerror("Falha de Execução", f"Erro interno ao publicar:\n{str(e)}")

    # TAB 3: ATUALIZAR APP
    def setup_tab_edit(self):
        scroll = ctk.CTkScrollableFrame(self.tab_edit, fg_color="transparent")
        scroll.pack(fill="both", expand=True)

        ctk.CTkLabel(scroll, text="App para Atualizar:").grid(row=0, column=0, padx=10, pady=(20,10), sticky="w")
        self.edit_combo_apps = ctk.CTkOptionMenu(scroll, width=400, values=["Aguardando..."])
        self.edit_combo_apps.grid(row=0, column=1, padx=10, pady=(20,10), sticky="w")

        ctk.CTkLabel(scroll, text="Novo Formato:").grid(row=1, column=0, padx=10, pady=10, sticky="w")
        self.edit_tipo = ctk.CTkOptionMenu(scroll, width=300, values=["Nova Pasta (Web App)", "Novo Arquivo (.exe/.apk)"])
        self.edit_tipo.grid(row=1, column=1, padx=10, pady=10, sticky="w")

        self.btn_edit_caminho = ctk.CTkButton(scroll, text="📁 Selecionar Nova Versão", command=self.selecionar_app_edit)
        self.btn_edit_caminho.grid(row=2, column=0, padx=10, pady=20, sticky="w")
        self.lbl_edit_caminho = ctk.CTkLabel(scroll, text="Nenhum arquivo selecionado", text_color="gray")
        self.lbl_edit_caminho.grid(row=2, column=1, padx=10, pady=20, sticky="w")

        self.btn_publicar_edit = ctk.CTkButton(scroll, text="⚙️ INJETAR ATUALIZAÇÃO", fg_color="#cc7a00", font=("Roboto", 14, "bold"), height=45, command=self.processar_edit_app)
        self.btn_publicar_edit.grid(row=3, column=0, columnspan=2, pady=30)

    def carregar_apps_existentes(self):
        ae = []
        p_cad = self.base_dir / "src" / "content" / "aplicativos" 
        if p_cad.exists(): ae.extend([f"Cadastro CMS ({p.stem})" for p in p_cad.glob("*.md")])

        p_pub = self.base_dir / "public"
        if p_pub.exists():
            for p in p_pub.iterdir():
                if p.is_dir() and p.name not in ["admin", "assets", "blog"] and (p / "index.html").exists():
                    ae.append(f"Web App ({p.name})")
                    
        p_apps = self.base_dir / "public" / "apps"
        if p_apps.exists():
            for p in p_apps.iterdir():
                if p.is_dir() and (p / "index.html").exists(): ae.append(f"Web App ({p.name})")

        p_down = self.base_dir / "public" / "downloads"
        if p_down.exists():
            for p in p_down.iterdir():
                if p.is_file() and p.suffix in [".exe", ".apk"]: ae.append(f"Binário ({p.name})")

        if ae:
            ae = list(dict.fromkeys(ae))
            self.edit_combo_apps.configure(values=ae)
            self.edit_combo_apps.set(ae[0])
        else:
            self.edit_combo_apps.configure(values=["Nenhum sistema encontrado"])

    def selecionar_app_edit(self):
        c = filedialog.askdirectory() if "Pasta" in self.edit_tipo.get() else filedialog.askopenfilename()
        if c:
            self.caminho_app_edit = c
            self.lbl_edit_caminho.configure(text=c[:60] + "...", text_color="white")

    def processar_edit_app(self):
        try:
            if not self.caminho_app_edit: 
                return messagebox.showwarning("Aviso", "Selecione o novo arquivo ou pasta da atualização.")
            
            slug_cru = self.edit_combo_apps.get()
            if "Nenhum" in slug_cru or "Aguardando" in slug_cru:
                return messagebox.showwarning("Aviso", "Nenhum sistema válido selecionado para atualizar.")
                
            slug = slug_cru.split("(")[-1].replace(")", "").strip()
            origem = Path(self.caminho_app_edit)
            
            self.log(f"Iniciando atualização de segurança/recursos do app: '{slug}'...")
            
            if "Pasta" in self.edit_tipo.get():
                d = self.base_dir / "public" / "apps" / slug
                if d.exists(): shutil.rmtree(d)
                shutil.copytree(origem, d, dirs_exist_ok=True)
                
                # Como houve atualização substancial da ferramenta, notifica o sitemap
                self.atualizar_sitemap(f"/apps/{slug}/", priority="0.9", changefreq="daily")
            else:
                d = self.base_dir / "public" / "downloads"
                d.mkdir(parents=True, exist_ok=True)
                shutil.copy(origem, d / origem.name)
                
            self.log("✅ Atualização injetada no ecossistema com sucesso!")
            self.caminho_app_edit = ""
            self.lbl_edit_caminho.configure(text="Nenhum arquivo selecionado")
            
            threading.Thread(target=self.executar_git_background, args=(f"🔄 Update Core: {slug}",)).start()
            
        except Exception as e:
            self.log(f"❌ ERRO NA ATUALIZAÇÃO: {str(e)}")
            messagebox.showerror("Erro Crítico", f"Falha ao atualizar o sistema:\n{str(e)}")

    # TAB 4: ESCREVER BLOG (AGORA COM SEO AUTOMÁTICO)
    def setup_tab_blog(self):
        scroll = ctk.CTkScrollableFrame(self.tab_blog, fg_color="transparent")
        scroll.pack(fill="both", expand=True)

        ctk.CTkLabel(scroll, text="Título:").grid(row=0, column=0, padx=10, pady=(15,5), sticky="w")
        self.blog_titulo = ctk.CTkEntry(scroll, width=600)
        self.blog_titulo.grid(row=0, column=1, padx=10, pady=(15,5), sticky="w")

        ctk.CTkLabel(scroll, text="Capa URL:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.blog_capa = ctk.CTkEntry(scroll, width=600)
        self.blog_capa.grid(row=1, column=1, padx=10, pady=5, sticky="w")

        ctk.CTkLabel(scroll, text="SEO (Descrição curta do Google):").grid(row=2, column=0, padx=10, pady=5, sticky="nw")
        self.blog_desc = ctk.CTkTextbox(scroll, width=600, height=60)
        self.blog_desc.grid(row=2, column=1, padx=10, pady=5, sticky="w")

        ctk.CTkLabel(scroll, text="Conteúdo (Markdown):").grid(row=3, column=0, padx=10, pady=5, sticky="nw")
        self.blog_conteudo = ctk.CTkTextbox(scroll, width=600, height=200)
        self.blog_conteudo.grid(row=3, column=1, padx=10, pady=5, sticky="w")

        ctk.CTkButton(scroll, text="📝 PUBLICAR ARTIGO", fg_color="#0066cc", height=45, command=self.processar_blog).grid(row=4, column=0, columnspan=2, pady=20)

    def processar_blog(self):
        try:
            titulo = self.blog_titulo.get().strip()
            if not titulo:
                return messagebox.showwarning("Aviso", "O Título do artigo é obrigatório!")
                
            self.log(f"Renderizando Artigo SEO: '{titulo}'...")
            slug = self.gerar_slug(titulo)
            pb = self.base_dir / "src" / "content" / "artigos"
            pb.mkdir(parents=True, exist_ok=True)
            
            desc_limpa = self.blog_desc.get("1.0", "end-1c").strip().replace('"', "'").replace('\n', ' ')
            
            conteudo = f"""---
title: "{titulo}"
date: "{datetime.now().strftime("%Y-%m-%d")}"
description: "{desc_limpa}"
image: "{self.blog_capa.get()}"
---

{self.blog_conteudo.get("1.0", "end-1c")}
"""
            with open(pb / f"{slug}.md", "w", encoding="utf-8") as f:
                f.write(conteudo)
                
            self.log("✅ Artigo compilado com sucesso! Injetando no Sitemap...")
            
            # CHAMA O MOTOR DE SEO AUTOMÁTICO PARA O NOVO POST
            self.atualizar_sitemap(f"/blog/{slug}.html", priority="0.8", changefreq="monthly")
            
            self.blog_titulo.delete(0, 'end')
            self.blog_capa.delete(0, 'end')
            self.blog_desc.delete("1.0", 'end')
            self.blog_conteudo.delete("1.0", 'end')
            
            threading.Thread(target=self.executar_git_background, args=(f"📝 Post Publicado: {titulo} (+SEO)",)).start()
            
        except Exception as e:
            self.log(f"❌ ERRO AO CRIAR ARTIGO: {str(e)}")
            messagebox.showerror("Erro de Compilação", f"Ocorreu um erro interno:\n{str(e)}")

if __name__ == "__main__":
    app = SilvaDigitalTechAdmin()
    app.mainloop()