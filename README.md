# 📋 Conect Agenda

Agenda no estilo Trello desenvolvida para organizar visualmente os serviços atribuídos às equipes de suporte e infraestrutura. Cada tarefa é representada por um card que pode ser movimentado entre diferentes listas (como "A Fazer", "Em Andamento", "Concluído"), facilitando a gestão do dia a dia técnico.

---

## 🚀 Funcionalidades

- ✅ Criação de listas e cartões
- 🔄 Drag-and-drop entre listas
- 🔐 Autenticação de usuários via Firebase Auth
- 🔥 Sincronização em tempo real com Firestore
- 📌 Organização visual estilo Kanban
- 🔍 Visibilidade e rastreabilidade de tarefas por equipe

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Vue.js
- **Backend/Banco:** Firebase (Firestore + Auth)
- **Deploy:** Firebase Hosting
- **Outros:** Firebase SDK, VueDraggable (SortableJS), Pinia

---

## 📦 Estrutura do Projeto

```plaintext
/conect-agenda
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── router/
│   ├── stores/
│   ├── views/
│   └── App.vue
├── firebase.json
├── vite.config.js
└── README.md
```
