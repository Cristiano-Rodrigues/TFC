\clearpage

# 1. Introdução

Na era da economia digital, o volume de dados gerados pelas organizações cresce a um ritmo acelerado. A informação deixou de ser apenas um subproduto das operações comerciais e administrativas para se consolidar como um dos principais activos estratégicos das corporações, capaz de sustentar a tomada de decisão, promover a inovação e reforçar vantagens competitivas num mercado globalizado. 

Historicamente, as organizações transitaram do arquivamento físico para a digitalização massiva, criando vastos repositórios digitais. Contudo, a mera posse de dados não se traduz automaticamente em conhecimento útil ou accionável. As estruturas empresariais enfrentam hoje o desafio não apenas de armazenar informação, mas de a processar, classificar e recuperar de forma tempestiva e precisa. A proliferação de plataformas de comunicação, serviços de *cloud* isolados, caixas de correio electrónico e servidores de ficheiros originou o fenómeno dos "silos de informação", onde o conhecimento fica fragmentado e inacessível para quem dele necessita transversalmente.

É neste cenário complexo de sobrecarga informacional que a Inteligência Artificial (IA) tem impulsionado transformações significativas. Em particular, os avanços no Processamento de Linguagem Natural (NLP) e o surgimento dos Modelos de Linguagem de Grande Escala (LLMs) representam um ponto de viragem. Estas tecnologias permitem ultrapassar as limitações das ferramentas de pesquisa tradicionais baseadas em palavras-chave, introduzindo a capacidade de compreender o contexto, a semântica e a intenção por detrás da consulta de um utilizador. Quando combinados com Sistemas Multiagentes — onde entidades de IA autónomas colaboram para executar tarefas complexas — e com a arquitectura *Retrieval-Augmented Generation* (RAG), torna-se possível transformar repositórios estáticos e não estruturados em bases de conhecimento dinâmicas e conversacionais. O presente trabalho aborda esta transição e procura colmatar a lacuna tecnológica, propondo uma solução moderna de gestão do conhecimento adaptada à realidade organizacional contemporânea, com especial enfoque no panorama angolano.

## 1.1. Problemática da Pesquisa

No contexto das organizações angolanas, a gestão da informação apresenta desafios estruturais profundos. A informação encontra-se frequentemente dispersa em silos isolados, distribuída por documentos locais, caixas de correio electrónico e plataformas de comunicação fragmentadas. A predominância de processos manuais e a dependência de sistemas de arquivo legados dificultam severamente a recuperação rápida de dados críticos para a tomada de decisão. Historicamente, as iniciativas de digitalização e modernização tecnológica em Angola e em contextos africanos similares têm priorizado a aquisição de infraestrutura de hardware e o acesso básico à rede, negligenciando frequentemente o desenvolvimento da camada de inteligência aplicacional necessária para extrair valor dos dados [@njohRelationshipModernInformation2018].

O Ministério das Telecomunicações, Tecnologias de Informação e Comunicação Social (MTTI) reconhece esta lacuna, sublinhando a necessidade urgente de transição para serviços digitais mais eficientes no seu Livro Branco sobre as TIC [@mttiLivroBrancoTIC2019]. Adicionalmente, @quialaGOVERNOELETRONICOUMA2023 evidenciam que a modernização administrativa em Angola carece de sistemas integrados que superem as barreiras da burocracia documental tradicional. Apesar da evolução global, a Inteligência Artificial é ainda frequentemente percepcionada nestas organizações como uma ferramenta futurista ou inacessível, e não como uma necessidade operacional imediata para a gestão do conhecimento.

Diante deste cenário, a presente investigação estrutura-se em torno da seguinte **pergunta central**: *Como desenvolver um sistema de gestão da informação organizacional, baseado em agentes de inteligência artificial, capaz de centralizar, classificar e facilitar a recuperação inteligente da informação em organizações angolanas?*

## 1.2. Objectivo da Pesquisa

O objectivo geral desta investigação consiste em desenvolver um protótipo funcional de um sistema baseado em agentes de Inteligência Artificial para apoiar a centralização, a classificação e a recuperação inteligente da informação em contexto organizacional.

Para alcançar este propósito, definiram-se os seguintes objectivos específicos, que orientam as etapas da pesquisa e do desenvolvimento:

*   Identificar e caracterizar os principais desafios na gestão da informação no contexto empresarial angolano;
*   Analisar as soluções tecnológicas existentes para a gestão documental e a recuperação de conhecimento (estado da arte);
*   Modelar a arquitectura técnica de um sistema baseado em agentes de Inteligência Artificial, desenhando a interacção entre os módulos de ingestão, indexação vectorial e síntese de respostas;
*   Implementar um protótipo funcional do sistema proposto, assegurando requisitos de segurança, suporte *multi-tenant* e controlo de acessos baseado em papéis (RBAC);
*   Avaliar o desempenho do sistema construído, aferindo a relevância qualitativa das respostas geradas e a eficiência temporal na recuperação de informação.

## 1.3. Justificativa

A pertinência deste estudo sustenta-se tanto em dimensões de ordem socioeconómica como académica. Do ponto de vista socioeconómico e organizacional, a ineficiência na recuperação de informação representa um custo oculto significativo para as empresas. A adopção de sistemas que automatizem a gestão documental e proporcionem respostas precisas em linguagem natural contribui directamente para a redução do tempo gasto em tarefas administrativas redundantes, melhorando a eficácia da tomada de decisão estratégica [@bealGestaoEstrategicaInformacao2004]. A implementação de um sistema deste tipo em organizações angolanas pode contribuir para a maturidade digital do tecido empresarial local, evidenciando que a IA é aplicável e acessível mesmo em mercados em desenvolvimento.

Sob a perspectiva académica e científica, a investigação sobre o papel da tecnologia na optimização do fluxo de informação organizacional constitui um campo de grande relevância [@detlorInformationManagement2010]. Este projecto procura explorar a aplicação integrada da arquitectura *Retrieval-Augmented Generation* (RAG) e de Sistemas Multiagentes no domínio do processamento documental e de informações de outras fontes. Ao disponibilizar e documentar uma arquitectura de código aberto aplicável a ambientes multi-tenant e adaptada ao contexto linguístico lusófono, este trabalho tem como intuito contribuir para a discussão sobre a democratização de sistemas de IA, oferecendo um exemplo prático da adopção destas tecnologias em países em vias de desenvolvimento.

## 1.4. Delimitação do Estudo

O presente trabalho circunscreve-se ao desenvolvimento de um protótipo de prova de conceito, não constituindo uma solução de produção pronta para implantação em larga escala. A validação do sistema é realizada num ambiente controlado de simulação empresarial, composto por um único *tenant* de teste com utilizadores fictícios alocados a diferentes departamentos e níveis hierárquicos, conforme descrito na secção 3.3. Na sua fase actual, o sistema processa exclusivamente informação em formato de texto — documentos, e-mails e mensagens — não abrangendo conteúdos multimédia como imagem, áudio ou vídeo. Finalmente, o âmbito da investigação está circunscrito ao contexto organizacional angolano, pelo que a generalização dos resultados a outros contextos requer estudos complementares.

## 1.5. Organização do Trabalho

O presente trabalho encontra-se estruturado em cinco capítulos fundamentais que espelham a trajectória metodológica da investigação.

O **Capítulo 1 (Introdução)** apresenta o contexto da pesquisa, formula o problema, enuncia os objectivos pretendidos e fundamenta a relevância do estudo.

O **Capítulo 2 (Fundamentação Teórica)** estabelece a base conceptual do trabalho, revendo a literatura sobre Gestão da Informação Organizacional, Inteligência Artificial, Modelos de Linguagem e a arquitectura técnica subjacente aos Sistemas Multiagentes e ao RAG, culminando numa análise comparativa do estado da arte.

O **Capítulo 3 (Procedimentos Metodológicos)** descreve a natureza e a abordagem da pesquisa, detalhando os métodos de recolha de dados, a configuração da amostra de testes e as estratégias adoptadas para a construção e avaliação do conhecimento e do software produzido.

O **Capítulo 4 (Resultados da Pesquisa)** é dedicado à vertente empírica e prática do projecto. Nele, apresenta-se a metodologia de desenvolvimento do protótipo, a modelagem UML (casos de uso, classes, base de dados), a arquitectura lógica da solução e as evidências de funcionamento através de interfaces, documentação de código e resultados de testes.

O **Capítulo 5 (Considerações Finais)**, por fim, sintetiza as principais conclusões alcançadas, verifica o cumprimento dos objectivos e lança sugestões para futuros desenvolvimentos e aplicações do sistema.
