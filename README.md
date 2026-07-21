# Vouya — Aplicação Web Frontend

> Uma aplicação web interativa e rica em recursos para planejamento de viagens e comunidade, construída com JavaScript puro (vanilla JS), contando com persistência no lado do cliente, itinerários dinâmicos, feed da comunidade e fluxos de reserva em tempo real.

---

## 🚀 O que há de novo na v2.6

* **Feed da Comunidade e Compartilhamento Social:**
* **FAB Central Estilo Instagram:** Um botão de ação flutuante elevado na barra de navegação inferior (+) posicionado entre Explorar e Viagens para abrir instantaneamente um menu de escolha para postagens.
* **Aba de Viagens com Visualização Dupla:** Alterne perfeitamente entre **"Minhas viagens"** (planejadores de viagens futuras/passadas) e o **"Feed da comunidade"** (postagens da comunidade semeada + as suas, completo com um filtro *Todas/Minhas*).
* **Compositores Interativos:**
* *Compositor de Avaliação:* Escolha um destino, toque em uma avaliação por estrelas e escreva sua opinião. É publicado instantaneamente no feed da comunidade e sincronizado diretamente com a aba de avaliações daquele destino na tela de detalhes.
* *Compositor de Momentos:* Uma postagem mais livre (sem avaliação) com foto opcional, para atualizações gerais de uma viagem.


* **Ações Integradas:** Clicar em "Deixar uma avaliação" em uma viagem passada agora abre o compositor de avaliações real pré-preenchido com o destino daquela viagem.
* **Engajamento:** Curtidas em postagens do feed que podem ser alternadas e que persistem como o restante dos dados.



---

## 🛠️ Recursos Principais (v2.5)

* **Camada de Dados no Lado do Cliente e Persistência:** Viagens, favoritos, contatos de emergência, perfil e configurações são salvos no `localStorage` e sobrevivem a uma atualização de página. Use **Perfil → "Redefinir dados de demonstração"** para restaurar os dados originais a qualquer momento.
* **13 Destinos Reais:** Com preços, pontuação de segurança, avaliações e fotos próprios — a aba Explorar, a seção "Em destaque" da Início e a tela de detalhes do destino leem do mesmo conjunto de dados em vez de um único exemplo hardcoded.
* **Fluxo de Reserva Funcional:** Explorar $\rightarrow$ Detalhes do destino $\rightarrow$ "Adicionar às minhas viagens" abre uma tela de Reserva real (datas, número de viajantes, proteção opcional Vouya Shield, total em tempo real) e cria uma viagem real ao confirmar, que aparece imediatamente em Viagens e Itinerário.
* **Itinerários de Múltiplas Viagens:** Cada viagem possui seu próprio plano dia a dia. A tela de Itinerário sempre reflete a viagem em que você tocou, e a reordenação por *drag-and-drop* (arrastar e soltar) é salva por viagem/dia.
* **CRUD Real:** Adicione/remova contatos de emergência, adicione/remova paradas no itinerário, edite seu nome de perfil e nível, tudo com validação de formulário em linha (*inline*).
* **Central de Notificações:** Uma central de notificações real alimentada por eventos de viagens e segurança (por exemplo, confirmar uma reserva ou enviar um SOS gera uma notificação), com um indicador de não lidas no ícone de sino da tela Inicial.
* **SOS Mais Inteligente:** O painel de alerta chama seus contatos de emergência reais pelo nome, e o envio de um alerta registra uma entrada real em "Atividade recente" na tela de Segurança.

---

## 🖼️ Gerenciamento de Ativos e Imagens

Este frontend utiliza fotografias do Unsplash com links diretos e avatares de espaço reservado do `pravatar.cc` em vez de arquivos binários embutidos, já que o escopo do projeto exige **zero dependências de backend/externas** no código. A hospedagem de imagens é a única exceção, usada puramente para que a demonstração tenha fotografias realistas sem carregar grandes ativos binários nesta entrega.

### Como substituir por suas próprias imagens para produção:

1. Arraste e solte arquivos nesta pasta (por exemplo, `assets/destinations/kyoto.jpg`).
2. Substitua o campo `img` correspondente dentro do array `destinations` nos dados iniciais no topo de `js/app.js` (função `buildSeedData`).
