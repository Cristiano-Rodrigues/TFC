\clearpage
\setcounter{section}{5}

# 5. Considerações Finais

## 5.1. Conclusões

Este estudo propôs-se a avaliar a viabilidade técnica de um protótipo de sistema de gestão da informação organizacional baseado num paradigma multiagente, capaz de centralizar, estruturar e recuperar dados em ambientes empresariais angolanos. Através da implementação de uma arquitectura *Retrieval-Augmented Generation* (RAG) suportada por uma interface Next.js, uma base de dados relacional vectorial (PostgreSQL com `pgvector`) e orquestração central de eventos via n8n — onde múltiplos agentes de Inteligência Artificial especializados colaboram autonomamente utilizando ferramentas (*tool use*) —, logrou-se construir uma solução eficiente e activa.

Os testes comportamentais evidenciaram que os agentes conseguem destrinçar informação relevante de ruído em mensagens corporativas, enquanto a avaliação qualitativa comprovou o respeito pelo isolamento de inquilinos (*multi-tenancy*) e pela segurança departamental (RBAC). Com tempos médios de pesquisa inferiores a 10 segundos e respostas factualmente alinhadas ao contexto autorizado, conclui-se que a adopção de sistemas multiagentes para a gestão inteligente do conhecimento, através de componentes maioritariamente de código aberto ou auto-hospedáveis, proporciona um caminho concreto para a aceleração da maturidade digital nas organizações em Angola.

## 5.2. Limitações

Importa reconhecer as seguintes limitações inerentes ao sistema proposto na sua fase actual de desenvolvimento:

- **Maturidade de protótipo:** o sistema encontra-se em fase de prova de conceito, carecendo de funcionalidades de produção como tratamento robusto de erros, monitorização, *logging* avançado e recuperação de falhas.
- **Autonomia operacional restrita:** actualmente, os agentes de IA actuam de forma estritamente reactiva perante eventos de ingestão ou consulta, não possuindo proactividade autónoma para explorar continuamente bases de dados externas ou sugerir melhorias processuais despoletadas por iniciativa própria. O seu leque de *tool use* está circunscrito às funções autorizadas pelo orquestrador.
- **Dependência de serviços externos:** a geração de \textit{embeddings} (Cohere, modelo *embed-multilingual-v3.0*) e a síntese de respostas (LLM via API) dependem de serviços de IA proprietários, o que introduz custos operacionais recorrentes e uma dependência de conectividade e de fornecedores terceiros.

## 5.3. Sugestões e Recomendações

Com base nas limitações identificadas durante o desenvolvimento do protótipo e nas particularidades do ecossistema tecnológico angolano, sugerem-se as seguintes linhas de investigação e melhorias futuras:

1.  **Adopção de Modelos de Linguagem Locais (*On-Premise*):** Tendo em conta os desafios de conectividade e estabilidade de internet em diversas províncias de Angola, recomenda-se explorar a integração de LLMs locais e de código aberto (como o *Llama 3* ou *Mistral* executados via *Ollama* em servidores internos). Isto eliminaria a dependência de APIs externas de inteligência artificial (como a Cohere), reduziria custos recorrentes de faturação em divisas estrangeiras e garantiria total soberania de dados.
2.  **Extensão para Processamento de Multimédia:** Recomenda-se expandir o pipeline de ingestão documental para suportar o reconhecimento óptico de caracteres (OCR) em imagens digitalizadas de documentos legados, bem como a transcrição automática de áudios de reuniões corporativas (usando modelos como o *Whisper*), enriquecendo a base de conhecimento comum.
3.  **Estudo de Campo com Utilizadores Reais:** Realizar um estudo de caso piloto e de usabilidade (SUS — *System Usability Scale*) integrado numa organização angolana real, por um período contínuo de 30 dias, para avaliar a curva de aprendizagem dos utilizadores na interface conversacional e o impacto prático na redução do tempo gasto a procurar procedimentos internos.
4.  **Refinamento de Pesquisa Híbrida:** Implementar uma estratégia de pesquisa híbrida que combine a busca semântica vectorial (actualmente suportada pelo `match_chunks()`) com a pesquisa de texto completo tradicional (*Full-Text Search* - FTS) baseada em palavras-chave no PostgreSQL. Esta combinação tende a melhorar a recuperação de termos técnicos muito específicos, abreviaturas legais ou códigos internos da empresa.
