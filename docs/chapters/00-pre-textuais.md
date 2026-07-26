---
# Metadados opcionais para o pandoc
---

\begin{titlepage}
\begin{center}
\includegraphics[width=6cm]{docs/images/isaf-logo.png}

\vspace{0.5cm}
{\Large \textbf{INSTITUTO SUPERIOR DE ADMINISTRAÇÃO E FINANÇAS}}\\[0.2cm]
{\large \textbf{DEPARTAMENTO DE CIÊNCIAS E TECNOLOGIA}}

\vspace{4.5cm}
{\Large \textbf{SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS}}

\vspace{4cm}
{\large \textbf{CRISTIANO RODRIGUES}}

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
{\large \textbf{DEPARTAMENTO DE CIÊNCIAS E TECNOLOGIA}}

\vspace{3.5cm}
{\Large \textbf{SISTEMA DE GESTÃO DA INFORMAÇÃO ORGANIZACIONAL BASEADO EM AGENTES DE INTELIGÊNCIA ARTIFICIAL PARA ORGANIZAÇÕES ANGOLANAS}}

\vspace{2cm}
{\large \textbf{CRISTIANO RODRIGUES}}

\vspace{2cm}
\begin{flushright}
\begin{minipage}{8cm}
\small
Trabalho de Conclusão de Curso apresentado ao Instituto Superior de Administração e Finanças como parte dos requisitos para obtenção do grau académico de Licenciado em Informática de Gestão Financeira.\\[0.5cm]
\textbf{Orientador:} Prof. Lírio Sandro Silva Ramalheira
\end{minipage}
\end{flushright}

\vfill
{\large \textbf{Luanda, 2026}}
\end{center}
\end{titlepage}

\newpage
\thispagestyle{empty}

\begin{center}
{\Large \textbf{FOLHA DE APROVAÇÃO E ORIGINALIDADE}}
\end{center}

\vspace{1cm}
\noindent
\textbf{Autor:} Cristiano Rodrigues \\
\textbf{Título:} Sistema de Gestão da Informação Organizacional Baseado em Agentes de Inteligência Artificial para Organizações Angolanas

\vspace{1cm}
\noindent
Declaro por minha honra que este Trabalho de Conclusão de Curso, apresentado ao Instituto Superior de Administração e Finanças como parte dos requisitos para obtenção do grau académico de Licenciado em Informática de Gestão Financeira, é original e de minha autoria, não tendo sido submetido para avaliação em nenhuma outra instituição. Todas as fontes utilizadas estão devidamente citadas nas referências bibliográficas.

\vspace{1.5cm}
\begin{center}
\rule{10cm}{0.1mm} \\
Cristiano Rodrigues \\
\textit{(Assinatura do Autor)}
\end{center}

\vspace{1cm}
% O espaço reservado para as assinaturas do júri (orientador, arguente e presidente) 
% encontra-se ocultado (comentado) conforme as suas instruções ("Não incluir ainda").
% Quando necessário, remover os comentários abaixo:

% \vspace{2cm}
% \begin{center}
% \textbf{Membros do Júri}
% \end{center}
% \vspace{1.5cm}
% \noindent\rule{7cm}{0.1mm} \hfill \rule{7cm}{0.1mm} \\
% Presidente do Júri \hfill Arguente \\
% 
% \vspace{2cm}
% \begin{center}
% \rule{7cm}{0.1mm} \\
% Orientador
% \end{center}

\newpage
\pagenumbering{roman}

\section*{Dedicatória}

\vspace*{12cm}
\begin{flushright}
\begin{minipage}{8cm}
\textit{Dedico este trabalho à minha mãe, Santa Madalena Rodrigues, \\
por ter sido a minha maior inspiração e o pilar inabalável \\
que me impulsionou a terminar os estudos.}
\end{minipage}
\end{flushright}

\newpage

\section*{Agradecimentos}

Expresso a minha mais profunda e sincera gratidão à minha mãe, Santa Madalena Rodrigues, e aos meus avós, cujo apoio material, financeiro e, acima de tudo, emocional foram determinantes ao longo de toda a minha jornada estudantil. Sem os vossos sacrifícios, paciência e incentivos constantes, a concretização deste marco académico e pessoal não teria sido possível. O meu muito obrigado.

\newpage

\section*{Resumo}

Este Trabalho de Conclusão de Curso apresenta o desenvolvimento e a avaliação de um protótipo de sistema de Gestão da Informação Organizacional suportado por Inteligência Artificial, desenhado especificamente para mitigar a fragmentação e os silos de dados nas organizações angolanas. Através de uma arquitetura \textit{Retrieval-Augmented Generation} (RAG), combinada com um orquestrador de automação (n8n), uma base de dados vetorial (Supabase/PostgreSQL com `pgvector`) e uma interface moderna em Next.js, a plataforma permite centralizar acervos documentais e oferecer pesquisas conversacionais de alta precisão. O sistema foca-se rigorosamente no isolamento \textit{multi-tenant} e num controlo de acessos baseado em funções e departamentos (RBAC/ABAC), garantindo que os utilizadores apenas interajam com informação estritamente autorizada, mitigando o risco de alucinações e fugas de dados confidenciais. Os resultados práticos validam a viabilidade operacional e técnica desta solução, evidenciando respostas rápidas e metodologicamente seguras, democratizando assim o acesso ao conhecimento institucional.

\vspace{0.5cm}
\noindent \textbf{Palavras-chave:} Inteligência Artificial, RAG, Gestão do Conhecimento, Controlo de Acessos, Multi-Tenant.

\newpage

\section*{Abstract}

This final degree project presents the development and evaluation of an Artificial Intelligence-supported Organizational Information Management prototype, specifically designed to mitigate data fragmentation and information silos within Angolan organizations. Through a Retrieval-Augmented Generation (RAG) architecture, combined with a low-code automation orchestrator (n8n), a vector database (Supabase/PostgreSQL with `pgvector`), and a modern Next.js interface, the platform allows the centralization of document collections and provides highly accurate conversational search capabilities. The system strictly focuses on multi-tenant isolation and access control based on roles and departments (RBAC/ABAC), ensuring that users only interact with strictly authorized information, thereby mitigating the risk of AI hallucinations and confidential data leaks. Practical results validate the operational and technical feasibility of this solution, demonstrating fast and methodologically secure responses, ultimately democratizing access to institutional knowledge.

\vspace{0.5cm}
\noindent \textbf{Keywords:} Artificial Intelligence, RAG, Knowledge Management, Access Control, Multi-Tenant.

\newpage

\newpage

\renewcommand{\contentsname}{Índice Geral}
\renewcommand{\listfigurename}{Índice de Figuras}
\renewcommand{\listtablename}{Índice de Quadros}

\tableofcontents
\newpage

\listoffigures
\newpage

\listoftables
\newpage

\listoftabelas
\newpage

\clearpage
\pagenumbering{arabic}
