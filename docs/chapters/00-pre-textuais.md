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
{\large \textbf{CRISTIANO VLADMIR RODRIGUES}}\\[0.5cm]
\textbf{Orientador:} Msc. Lírio Ramalheira

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
Projecto de pesquisa apresentado ao Instituto Superior de Administração e Finanças – ISAF, exigência para obtenção do grau de Licenciatura em Informática de Gestão Financeira.\\[0.5cm]
\textbf{Orientador:} Msc. Lírio Ramalheira
\end{minipage}
\end{flushright}

\vfill
{\large \textbf{Luanda, 2026}}
\end{center}
\end{titlepage}

\newpage
\begin{titlepage}
\begin{center}
\includegraphics[width=6cm]{docs/images/isaf-logo.png}

\vspace{0.1cm}
{\Large \textbf{INSTITUTO SUPERIOR DE ADMINISTRAÇÃO E FINANÇAS}}\\[0.1cm]
{\large \textbf{CURSO DE INFORMÁTICA DE GESTÃO FINANCEIRA}}

\vspace{0.3cm}
{\large \textbf{SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS}}

\vspace{0.2cm}
{\large \textbf{CRISTIANO VLADMIR RODRIGUES}}

\vspace{0.1cm}
\begin{flushright}
\begin{minipage}{8cm}
\small
Projecto de pesquisa apresentado ao Instituto Superior de Administração e Finanças – ISAF, exigência para obtenção do grau de Licenciatura em Informática de Gestão Financeira.
\end{minipage}
\end{flushright}

\vspace{0.2cm}
BANCA EXAMINADORA

\vspace{0.2cm}
\rule{\linewidth}{1pt}\\[-0.1cm]
Prof. - Presidente da Banca\\[-0.1cm]
IGF/ISAF

\vspace{0.15cm}
\rule{\linewidth}{1pt}\\[-0.1cm]
Prof. - Primeiro oponente\\[-0.1cm]
IGF/ISAF

\vspace{0.15cm}
\rule{\linewidth}{1pt}\\[-0.1cm]
Prof. - Segundo oponente\\[-0.1cm]
IGF/ISAF

\vspace{0.15cm}
\rule{\linewidth}{1pt}\\[-0.1cm]
Secretário

\vfill
{\large \textbf{Luanda, 2026}}
\end{center}
\end{titlepage}

\newpage
\thispagestyle{empty}

\section*{Compromisso do Autor}

\noindent Eu, Cristiano Vladmir Rodrigues, portador do bilhete de identidade (BI) n° 006863777LA044 e estudante do curso de Informática de Gestão Financeira, declaro que:

\noindent O conteúdo do presente documento é um reflexo do meu trabalho pessoal e manifesto que, diante de qualquer notificação de plágio, cópia ou prejuízo à fonte original, sou responsável directo legal, financeira e administrativamente, sem afectar o orientador do trabalho, o ISAF e as demais instituições que colaboraram neste trabalho, assumindo as consequências derivadas de tais práticas.

\noindent E venho por meio desta, autorizar a disponibilização da versão aprovada do meu trabalho de fim de curso, SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS, na biblioteca do ISAF e em outros meios de divulgação electrónica da referida Instituição.

\vspace{3cm}
\noindent Assinatura: \rule{9cm}{0.5pt}

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

Este Trabalho Final de Curso apresenta o desenvolvimento e a avaliação de um protótipo de Gestão da Informação Organizacional suportado por Inteligência Artificial, desenhado especificamente para mitigar a fragmentação e os silos de dados nas organizações angolanas. A solução assenta numa arquitectura de agentes especializados, coordenados centralmente pelo orquestrador de automação n8n, expandindo o paradigma \textit{Retrieval-Augmented Generation} (RAG). Uma das principais contribuições práticas do sistema é a capacidade de os agentes analisarem autonomamente informação proveniente de diferentes fontes, incluindo canais de comunicação, identificando conteúdos relevantes e incorporando-os na base de conhecimento (Supabase/PostgreSQL com \texttt{pgvector}). Integrado a uma interface moderna em Next.js, o sistema possui isolamento \textit{multi-tenant} e controlo de acessos (RBAC/ABAC), garantindo que os utilizadores interajam estritamente com informação autorizada. Os resultados dos testes finais validam o comportamento e a coordenação dos agentes na recolha e processamento de dados, além de evidenciarem a eficiência e segurança na recuperação do conhecimento institucional. Para fins de transparência e reprodutibilidade, o código-fonte integral encontra-se disponível publicamente no GitHub (https://github.com/Cristiano-Rodrigues/TFC), e um protótipo funcional para demonstração pode ser acedido em https://tfc-lemon.vercel.app.

\vspace{0.5cm}
\noindent \textbf{Palavras-chave:} Inteligência Artificial, RAG, Gestão do Conhecimento.
\newpage

\section*{Abstract}

This final degree project presents the development and evaluation of an Artificial Intelligence-supported Organizational Information Management prototype, specifically designed to mitigate data fragmentation and information silos within Angolan organizations. The solution is based on an architecture of specialized agents, centrally coordinated by the n8n automation orchestrator, expanding the \textit{Retrieval-Augmented Generation} (RAG) paradigm. One of the main practical contributions of the system is the agents' ability to autonomously analyze information from different sources, including communication channels, identifying relevant content and incorporating it into the knowledge base (Supabase/PostgreSQL with \texttt{pgvector}). Integrated with a modern Next.js interface, the system features multi-tenant isolation and access control (RBAC/ABAC), ensuring that users interact strictly with authorized information. The results of the final tests validate the behavior and coordination of the agents in data collection and processing, in addition to demonstrating efficiency and security in the retrieval of institutional knowledge. For transparency and reproducibility purposes, the complete source code is publicly available on GitHub (https://github.com/Cristiano-Rodrigues/TFC), and a functional prototype for demonstration can be accessed at https://tfc-lemon.vercel.app.

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
    \item \textbf{CRUD} -- \textit{Create, Read, Update, Delete} (Criar, Ler, Actualizar, Eliminar)
    \item \textbf{DAC} -- \textit{Discretionary Access Control} (Controlo de Acesso Discricionário)
    \item \textbf{DER} -- Diagrama Entidade-Relacional
    \item \textbf{DOM} -- \textit{Document Object Model}
    \item \textbf{DPR} -- \textit{Dense Passage Retrieval} (Recuperação Densa de Passagens)
    \item \textbf{FTS} -- \textit{Full-Text Search} (Pesquisa de Texto Completo)
    \item \textbf{GPT} -- \textit{Generative Pre-trained Transformer}
    \item \textbf{IA} -- Inteligência Artificial
    \item \textbf{IaaS} -- \textit{Infrastructure as a Service} (Infra-estrutura como Serviço)
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
    \item \textbf{UML} -- \textit{Unified Modeling Language} (Linguagem de Modelação Unificada)
    \item \textbf{URL} -- \textit{Uniform Resource Locator}
    \item \textbf{UUID} -- \textit{Universally Unique Identifier}
\end{itemize}
\newpage

\clearpage
\pagenumbering{arabic}
