\clearpage

# 5. Considerações Finais

## 5.1. Conclusões

Este estudo propôs-se a responder à pergunta de investigação: *Como avaliar a viabilidade técnica de um protótipo de sistema de gestão da informação organizacional, baseado em orquestração de inteligência artificial, capaz de centralizar, classificar e facilitar a recuperação de dados em ambientes empresariais angolanos?* 

Através do desenho e desenvolvimento do protótipo funcional, logrou-se responder com sucesso a esta questão. A arquitectura concebida demonstrou a viabilidade técnica de construir um sistema robusto de gestão do conhecimento assente na combinação de uma interface web dinâmica em Next.js, uma base de dados relacional e vectorial Supabase/PostgreSQL com extensão `pgvector`, e uma camada de orquestração visual de baixo código via n8n. 

Relativamente aos objectivos específicos definidos no início deste trabalho, foram alcançadas as seguintes conclusões:

1.  **Identificação dos Desafios Locais:** O estudo confirmou que as organizações em Angola ainda sofrem com silos severos de informação e processos documentais arcaicos, limitando a agilidade operacional.
2.  **Estado da Arte:** A revisão literária fundamentou o RAG como a arquitectura ideal para mitigar alucinações de modelos de linguagem em ambientes empresariais, identificando o n8n como um orquestrador ágil e visualmente auditável.
3.  **Modelagem e Implementação:** A modelagem baseada em UML e o posterior desenvolvimento do protótipo demonstraram que a **Opção A (Abstração Unificada)** — agregando PDFs, ficheiros e artigos de Wiki sob a entidade única `documents` diferenciados por `source_type` — é altamente eficiente. Esta escolha simplificou o pipeline de fragmentação e vectorização e facilitou a governança de dados.
4.  **Isolamento Multi-tenant e Segurança:** Os testes ao protótipo indicam que a segurança de acessos departamentais e hierárquicos (RBAC) e o isolamento rígido de inquilinos (*multi-tenancy*) são perfeitamente executáveis ao nível relacional do PostgreSQL. A implementação da chave `company_id` na tabela `documents` e o desenvolvimento da função `match_chunks()` garantiram que os utilizadores pesquisassem apenas no escopo de conhecimento autorizado, prevenindo fugas de dados inter-empresa (*data leakage*).
5.  **Avaliação Temporal e Qualitativa:** Os ensaios preliminares de eficiência temporal sugerem tempos médios de resposta do chat inferiores a 3 segundos, o que é plenamente satisfatório para o quotidiano organizacional. Qualitativamente, a filtragem prévia das fontes na base de dados impediu que o LLM respondesse com base em informações confidenciais a utilizadores sem permissões adequadas, confirmando a viabilidade operacional do controlo de acessos relacional integrado ao RAG.

Em suma, embora a Inteligência Artificial seja ainda percepcionada localmente como um recurso distante ou de alto custo, este projecto demonstrou que a convergência de ferramentas open-source de baixo código e bases de dados híbridas permite conceber e operacionalizar sistemas avançados de inteligência documental com investimentos contidos, proporcionando uma via viável para a modernização e aceleração da maturidade digital em Angola.

## 5.2. Sugestões e Recomendações

Com base nas limitações identificadas durante o desenvolvimento do protótipo e nas particularidades do ecossistema tecnológico angolano, sugerem-se as seguintes linhas de investigação e melhorias futuras:

1.  **Adoção de Modelos de Linguagem Locais (*On-Premise*):** Tendo em conta os desafios de conectividade e estabilidade de internet em diversas províncias de Angola, recomenda-se explorar a integração de LLMs locais e de código aberto (como o *Llama 3* ou *Mistral* executados via *Ollama* em servidores internos). Isto eliminaria a dependência de APIs externas de inteligência artificial (como a Cohere), reduziria custos recorrentes de faturação em divisas estrangeiras e garantiria total soberania de dados.
2.  **Extensão para Processamento de Multimédia:** Recomenda-se expandir o pipeline de ingestão documental para suportar o reconhecimento ótico de caracteres (OCR) em imagens digitalizadas de documentos legados, bem como a transcrição automática de áudios de reuniões corporativas (usando modelos como o *Whisper*), enriquecendo a base de conhecimento comum.
3.  **Auditoria e Conformidade com a Lei de Proteção de Dados (APD):** Sugere-se o desenvolvimento de um módulo de auditoria de dados que detete automaticamente dados pessoais sensíveis (PII) durante a ingestão documental, em estrito alinhamento com a legislação de proteção de dados angolana em vigor, instruindo o pipeline a mascarar ou cifrar esses dados antes do envio para modelos gerativos externos.
4.  **Estudo de Campo com Utilizadores Reais:** Realizar um estudo de caso piloto e de usabilidade (SUS — *System Usability Scale*) integrado numa organização angolana real, por um período contínuo de 30 dias, para avaliar a curva de aprendizagem dos utilizadores na interface conversacional e o impacto prático na redução do tempo gasto a procurar procedimentos internos.
5.  **Refinamento de Pesquisa Híbrida:** Implementar uma estratégia de pesquisa híbrida que combine a busca semântica vectorial (atualmente suportada pelo `match_chunks()`) com a pesquisa de texto completo tradicional (*Full-Text Search* - FTS) baseada em palavras-chave no PostgreSQL. Esta combinação tende a melhorar a recuperação de termos técnicos muito específicos, abreviaturas legais ou códigos internos da empresa.
