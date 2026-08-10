---
# Metadados opcionais para o pandoc
---

\begin{titlepage}
\begin{center}
\includegraphics[width=6cm]{docs/images/isaf-logo.png}

\vspace{0.5cm}
{\Large \textbf{INSTITUTO SUPERIOR DE ADMINISTRAÇÃO E FINANÇAS}}\\[0.2cm]
{\large \textbf{CURSO DE INFORMÁTICA DE GESTÃO FINANCEIRA}}

\vspace{4.5cm}
{\Large \textbf{SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS}}

\vspace{4cm}
{\large \textbf{CRISTIANO VLADMIR RODRIGUES}}

\vfill
{\large \textbf{Luanda, 2026}}
\end{center}
\end{titlepage}

\newpage
\thispagestyle{empty}
\mbox{}
\newpage

\begin{titlepage}
\begin{center}
\includegraphics[width=6cm]{docs/images/isaf-logo.png}

\vspace{0.5cm}
{\Large \textbf{INSTITUTO SUPERIOR DE ADMINISTRAÇÃO E FINANÇAS}}\\[0.2cm]
{\large \textbf{CURSO DE INFORMÁTICA DE GESTÃO FINANCEIRA}}

\vspace{3.5cm}
{\Large \textbf{SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS}}

\vspace{2cm}
{\large \textbf{CRISTIANO VLADMIR RODRIGUES}}

\vspace{2cm}
\begin{flushright}
\begin{minipage}{8cm}
\small
Trabalho Final de Curso apresentado ao Instituto Superior de Administração e Finanças como parte dos requisitos para obtenção do grau académico de Licenciado em Informática de Gestão Financeira.\\[0.5cm]
\textbf{Orientador:} Msc. Lírio Ramalheira
\end{minipage}
\end{flushright}

\vfill
{\large \textbf{Luanda, 2026}}
\end{center}
\end{titlepage}

\newpage
\pagenumbering{roman}

\section*{Dedicatória}

\vspace*{12cm}
\begin{flushright}
\begin{minipage}{8cm}
\textit{Dedico este trabalho à minha mãe, Santa Madalena Rodrigues, \\
por ter sido a minha maior inspiração e o pilar incontornável \\
que me impulsionou a terminar os estudos.}
\end{minipage}
\end{flushright}

\newpage

\section*{Agradecimentos}

Expresso a minha mais profunda e sincera gratidão à minha mãe, Santa Madalena Rodrigues, e aos meus avós, Paulo Rodrigues Aníbal e Esperança Té Jorge, cujo apoio material, financeiro e, acima de tudo, emocional foram determinantes ao longo de toda a minha jornada estudantil. Sem os vossos sacrifícios, paciência e incentivos constantes, a concretização deste marco académico e pessoal não teria sido possível. O meu muito obrigado!

\newpage

\section*{Resumo}

Este Trabalho Final de Curso apresenta o desenvolvimento e a avaliação de um protótipo de sistema de Gestão da Informação Organizacional suportado por Inteligência Artificial, desenhado especificamente para mitigar a fragmentação e os silos de dados nas organizações angolanas. Através de uma arquitetura \textit{Retrieval-Augmented Generation} (RAG), combinada com um orquestrador de automação (n8n), uma base de dados vetorial (Supabase/PostgreSQL com `pgvector`) e uma interface moderna em Next.js, a plataforma permite centralizar acervos documentais e oferecer pesquisas por meio de conversação. O sistema foca-se no isolamento \textit{multi-tenant} e num controlo de acessos baseado em funções e departamentos (RBAC/ABAC), garantindo que os utilizadores apenas interajam com informação estritamente autorizada, ajudando a mitigar o risco de alucinações e fugas de dados confidenciais. Os resultados práticos validam a viabilidade operacional e técnica desta solução, evidenciando respostas rápidas e metodologicamente seguras, democratizando assim o acesso ao conhecimento institucional. Para fins de transparência e reprodutibilidade, o código-fonte integral encontra-se disponível publicamente no GitHub (https://github.com/Cristiano-Rodrigues/TFC), e um protótipo funcional para demonstração pode ser acedido em https://tfc-lemon.vercel.app.

\vspace{0.5cm}
\noindent \textbf{Palavras-chave:} Inteligência Artificial, RAG, Gestão do Conhecimento.
\newpage

\section*{Abstract}

This final degree project presents the development and evaluation of an Artificial Intelligence-supported Organizational Information Management prototype, specifically designed to mitigate data fragmentation and information silos within Angolan organizations. Through a \textit{Retrieval-Augmented Generation} (RAG) architecture, combined with a low-code automation orchestrator (n8n), a vector database (Supabase/PostgreSQL with `pgvector`), and a modern Next.js interface, the platform allows the centralization of document collections and provides conversational search capabilities. The system focuses on multi-tenant isolation and access control based on roles and departments (RBAC/ABAC), ensuring that users only interact with strictly authorized information, helping to mitigate the risk of AI hallucinations and confidential data leaks. Practical results validate the operational and technical feasibility of this solution, demonstrating fast and methodologically secure responses, ultimately democratizing access to institutional knowledge. For transparency and reproducibility purposes, the complete source code is publicly available on GitHub (https://github.com/Cristiano-Rodrigues/TFC), and a functional prototype for demonstration can be accessed at https://tfc-lemon.vercel.app.

\vspace{0.5cm}
\noindent \textbf{Keywords:} Artificial Intelligence, RAG, Knowledge Management.

\newpage

\newpage

\renewcommand{\contentsname}{Índice}
\renewcommand{\listfigurename}{Índice de Figuras}

\tableofcontents
\newpage

\listoffigures
\newpage

\listofquadros
\newpage

\listoftabelas
\newpage

\section*{Lista de Abreviaturas e Siglas}

\begin{itemize}
    \setlength{\itemsep}{0pt}
    \setlength{\parskip}{0pt}
    \setlength{\parsep}{0pt}
    \item \textbf{ABAC} -- \textit{Attribute-Based Access Control} (Controlo de Acessos Baseado em Atributos)
    \item \textbf{AI} -- \textit{Artificial Intelligence} (Inteligência Artificial)
    \item \textbf{ANN} -- \textit{Approximate Nearest Neighbor} (Vizinho Mais Próximo Aproximado)
    \item \textbf{APD} -- Agência de Protecção de Dados
    \item \textbf{API} -- \textit{Application Programming Interface} (Interface de Programação de Aplicações)
    \item \textbf{BERT} -- \textit{Bidirectional Encoder Representations from Transformers}
    \item \textbf{BM25} -- Best Matching 25
    \item \textbf{CBOW} -- \textit{Continuous Bag-of-Words}
    \item \textbf{CRUD} -- \textit{Create, Read, Update, Delete} (Criar, Ler, Atualizar, Eliminar)
    \item \textbf{DAC} -- \textit{Discretionary Access Control} (Controlo de Acesso Discricionário)
    \item \textbf{DER} -- Diagrama Entidade-Relacional
    \item \textbf{DOM} -- \textit{Document Object Model}
    \item \textbf{DPR} -- \textit{Dense Passage Retrieval} (Recuperação Densa de Passagens)
    \item \textbf{FTS} -- \textit{Full-Text Search} (Pesquisa de Texto Completo)
    \item \textbf{GPT} -- \textit{Generative Pre-trained Transformer}
    \item \textbf{IA} -- Inteligência Artificial
    \item \textbf{IaaS} -- \textit{Infrastructure as a Service} (Infraestrutura como Serviço)
    \item \textbf{IEC} -- \textit{International Electrotechnical Commission}
    \item \textbf{ISO} -- \textit{International Organization for Standardization}
    \item \textbf{ISR} -- \textit{Incremental Static Regeneration}
    \item \textbf{JWT} -- JSON Web Token
    \item \textbf{KMS} -- \textit{Knowledge Management Systems} (Sistemas de Gestão do Conhecimento)
    \item \textbf{LLM} -- \textit{Large Language Model} (Modelo de Linguagem de Grande Escala)
    \item \textbf{MAC} -- \textit{Mandatory Access Control} (Controlo de Acesso Obrigatório)
    \item \textbf{MTTI} -- Ministério das Telecomunicações, Tecnologias de Informação e Comunicação Social
    \item \textbf{NIST} -- \textit{National Institute of Standards and Technology}
    \item \textbf{NLP} -- \textit{Natural Language Processing} (Processamento de Linguagem Natural)
    \item \textbf{OCR} -- \textit{Optical Character Recognition} (Reconhecimento Óptico de Caracteres)
    \item \textbf{PaaS} -- \textit{Platform as a Service} (Plataforma como Serviço)
    \item \textbf{PDF} -- \textit{Portable Document Format}
    \item \textbf{PII} -- \textit{Personally Identifiable Information} (Informação Pessoal Identificável)
    \item \textbf{PLM} -- \textit{Pre-trained Language Model} (Modelo de Linguagem Pré-treinado)
    \item \textbf{PL/pgSQL} -- \textit{Procedural Language/PostgreSQL Structured Query Language}
    \item \textbf{RAG} -- \textit{Retrieval-Augmented Generation} (Geração Aumentada por Recuperação)
    \item \textbf{RBAC} -- \textit{Role-Based Access Control} (Controlo de Acessos Baseado em Papéis)
    \item \textbf{REST} -- \textit{Representational State Transfer}
    \item \textbf{RF} -- Requisito Funcional
    \item \textbf{RLS} -- \textit{Row Level Security} (Segurança ao Nível da Linha)
    \item \textbf{RNF} -- Requisito Não Funcional
    \item \textbf{RPA} -- \textit{Robotic Process Automation} (Automação Robótica de Processos)
    \item \textbf{SaaS} -- \textit{Software as a Service} (Software como Serviço)
    \item \textbf{SBERT} -- Sentence-BERT
    \item \textbf{SECI} -- \textit{Socialisation, Externalisation, Combination, Internalisation}
    \item \textbf{SMA} -- Sistemas Multiagentes
    \item \textbf{SQL} -- \textit{Structured Query Language}
    \item \textbf{SSG} -- \textit{Static Site Generation}
    \item \textbf{SSR} -- \textit{Server-Side Rendering}
    \item \textbf{SUS} -- \textit{System Usability Scale}
    \item \textbf{TIC} -- Tecnologias de Informação e Comunicação
    \item \textbf{TXT} -- \textit{Text File Format} (Ficheiro de Texto Simples)
    \item \textbf{UC} -- Caso de Uso (\textit{Use Case})
    \item \textbf{UML} -- \textit{Unified Modeling Language} (Linguagem de Modelagem Unificada)
    \item \textbf{URL} -- \textit{Uniform Resource Locator}
    \item \textbf{UUID} -- \textit{Universally Unique Identifier}
\end{itemize}
\newpage

\clearpage
\pagenumbering{arabic}
