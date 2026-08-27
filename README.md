# user-management-service-app

Cria um **frontend administrativo completo em React + TypeScript** para gerir **Utilizadores, Plataformas e Acessos às Plataformas**.

O sistema será um painel administrativo para uma estrutura centralizada de **Identity + Platform Access**.

## OBJETIVO PRINCIPAL

O sistema deve permitir:

1. Gerir utilizadores.
2. Gerir plataformas.
3. Vincular um utilizador a uma ou várias plataformas.
4. Vincular vários utilizadores a uma plataforma.
5. Criar uma nova plataforma e adicionar utilizadores existentes.
6. Identificar utilizadores antigos que já possuem acesso a uma plataforma, mas ainda não estão registados na nova estrutura centralizada.
7. Permitir importar/migrar esses utilizadores antigos para a nova estrutura.
8. Mostrar claramente quais utilizadores estão sincronizados e quais ainda precisam ser migrados.
9. Permitir gestão bidirecional:

   - Utilizador → Plataformas
   - Plataforma → Utilizadores

---

# DESIGN / UI

Criar uma interface moderna, profissional e empresarial.

Utilizar:

- Sidebar fixa
- Header
- Breadcrumbs
- Cards
- DataTables
- Filtros
- Pesquisa
- Modais/Dialogs
- Dropdowns
- Badges de status
- Toast notifications
- Confirmações antes de operações destrutivas
- Loading states
- Empty states
- Skeleton loading
- Paginação

A interface deve ser responsiva.

Utilizar uma aparência semelhante a um **Enterprise Admin Dashboard / SaaS Admin Panel**.

Não criar uma interface excessivamente colorida.

Priorizar:

- Clareza
- Organização
- Usabilidade
- Informação
- Ações rápidas

---

# SIDEBAR

Criar o seguinte menu:

```text
Dashboard

Identity
  ├── Utilizadores
  └── Utilizador ↔ Plataformas

Plataformas
  ├── Todas as Plataformas
  └── Utilizadores por Plataforma

Migração
  ├── Utilizadores Pendentes
  ├── Importar Utilizadores
  └── Histórico de Migrações
```

---

# 1. DASHBOARD

Criar uma página inicial com indicadores:

```text
Total de Utilizadores
        12.540

Utilizadores Ativos
        11.890

Total de Plataformas
        8

Acessos Ativos
        28.430

Utilizadores Pendentes de Migração
        342
```

Criar também:

### Plataformas

Mostrar cards ou tabela:

```text
INVOICE
1.245 utilizadores

FINANCE
2.430 utilizadores

ACADEMIC
5.230 utilizadores

CRM
890 utilizadores
```

### Alertas

Mostrar algo como:

```text
342 utilizadores encontrados em plataformas antigas
mas ainda não registados na nova estrutura.

[Ver utilizadores]
```

---

# 2. UTILIZADORES

Criar página:

```text
/identity/users
```

Tabela:

```text
ID
Nome
Username
Email
Status
Plataformas
Origem
Último acesso
Ações
```

Exemplo:

```text
1001
Isaac Bunga
isvaldo
isaac@email.com
ATIVO
3 plataformas
NOVO
26/08/2026
[Ver]
```

Filtros:

```text
Pesquisar...
Status
Plataforma
Origem
Data de criação
```

Origem deve permitir:

```text
CENTRAL
LEGACY
IMPORTED
```

---

# 3. DETALHE DO UTILIZADOR

Ao clicar num utilizador, abrir:

```text
/identity/users/:id
```

Mostrar:

### Informações

```text
Nome
Username
Email
Status
Data de criação
Último acesso
```

### Plataformas

Mostrar:

```text
┌─────────────────────────────────────┐
│ INVOICE              ATIVO          │
│ Desde: 12/03/2026                   │
│                                     │
│                    [Remover acesso] │
└─────────────────────────────────────┘
```

E:

```text
[ + Adicionar plataforma ]
```

Ao clicar:

```text
Adicionar plataforma

☐ INVOICE
☐ FINANCE
☐ ACADEMIC
☐ CRM
☐ HR

              [Cancelar] [Adicionar]
```

Permitir selecionar várias plataformas.

---

# 4. PLATAFORMAS

Criar:

```text
/platforms
```

Tabela:

```text
Código
Nome
Descrição
Utilizadores
Status
Criada em
Ações
```

Exemplo:

```text
INVOICE
Invoice Management
1.245 utilizadores
ATIVA

FINANCE
Finance Management
2.430 utilizadores
ATIVA
```

Botão:

```text
+ Nova Plataforma
```

Formulário:

```text
Código
Nome
Descrição
Status
```

---

# 5. DETALHE DA PLATAFORMA

Criar:

```text
/platforms/:id
```

Mostrar:

```text
INVOICE
Invoice Management

Total de utilizadores: 1.245
Utilizadores ativos: 1.198
Utilizadores pendentes: 47
```

Criar tabela:

```text
Utilizador
Username
Email
Status
Origem
Data de associação
Ações
```

Botão:

```text
+ Adicionar Utilizadores
```

Ao clicar:

```text
Adicionar utilizadores à plataforma

Pesquisar utilizador...

☐ Isaac Bunga
☐ João Manuel
☐ Maria Silva
☐ Pedro António

[Selecionar todos]

         [Cancelar] [Adicionar selecionados]
```

---

# 6. RELAÇÃO UTILIZADOR ↔ PLATAFORMA

Criar uma página específica:

```text
/identity/access
```

Mostrar uma tabela:

```text
Utilizador
Plataforma
Status
Origem
Data de associação
Ações
```

Exemplo:

```text
Isaac Bunga
INVOICE
ATIVO
CENTRAL

Isaac Bunga
FINANCE
ATIVO
CENTRAL

João Manuel
INVOICE
PENDENTE
LEGACY
```

Permitir:

```text
+ Associar utilizador
```

---

# 7. FUNCIONALIDADE MAIS IMPORTANTE — MIGRAÇÃO LEGACY

Criar uma área específica:

```text
/migration
```

O sistema precisa lidar com um cenário importante:

Existem utilizadores que **já existem nas plataformas antigas**, mas ainda não existem na nova estrutura centralizada.

Exemplo:

```text
Sistema antigo:

INVOICE
├── user001
├── user002
├── user003
└── user004

Nova estrutura:

Identity
├── user001
└── user003
```

Nesse caso:

```text
user002
user004
```

devem aparecer como:

> **Utilizadores encontrados na plataforma mas não registados na nova estrutura.**

---

# 8. UTILIZADORES PENDENTES DE MIGRAÇÃO

Criar:

```text
/migration/pending
```

Tabela:

```text
☐
Username
Nome
Email
Plataforma de origem
ID antigo
Estado
Correspondência encontrada
Ação
```

Exemplo:

```text
☐ user002
João Manuel
joao@email.com
INVOICE
OLD-2345
PENDENTE
Possível correspondência
[Resolver]

☐ user004
Maria Silva
maria@email.com
INVOICE
OLD-9821
PENDENTE
Sem correspondência
[Importar]
```

---

# 9. PROCESSO DE MIGRAÇÃO

Criar um fluxo guiado.

Ao clicar em:

```text
[Importar]
```

mostrar um modal/wizard:

### Passo 1 — Dados antigos

```text
Plataforma:
INVOICE

ID antigo:
OLD-9821

Username:
user004

Nome:
Maria Silva

Email:
maria@email.com
```

### Passo 2 — Procurar identidade existente

Mostrar:

```text
Encontrámos possíveis utilizadores:

Maria Silva
maria@email.com
Username: maria

[Selecionar]
```

Ou:

```text
Nenhuma identidade correspondente encontrada.
```

Nesse caso permitir:

```text
[+ Criar nova identidade]
```

### Passo 3 — Associar plataforma

Mostrar:

```text
Identidade:

Maria Silva

Plataforma:

INVOICE

Acesso:

ATIVO
```

### Passo 4 — Confirmar

```text
Resumo

Utilizador: Maria Silva
Plataforma: INVOICE
Origem: LEGACY

[Cancelar] [Confirmar Migração]
```

Depois:

```text
✓ Utilizador migrado com sucesso.
```

---

# 10. MIGRAÇÃO EM MASSA

Muito importante.

Na lista de utilizadores pendentes permitir:

```text
☐ user001
☐ user002
☐ user003
☐ user004
```

Selecionar:

```text
[Selecionados: 4]

[Importar selecionados]
```

Criar confirmação:

```text
Migrar 4 utilizadores?

Os utilizadores serão associados à nova
estrutura de Identity + Platform Access.

[Cancelar]
[Confirmar]
```

Mostrar progresso:

```text
Migração em andamento...

████████████░░░░ 75%

3 de 4 processados
```

Resultado:

```text
4 processados

✓ 3 migrados
⚠ 1 necessita de intervenção manual
```

---

# 11. DETECÇÃO DE DUPLICADOS / MATCHING

A interface deve suportar possíveis correspondências.

Exemplo:

```text
Utilizador Legacy:

João Manuel
joao@gmail.com

Possível identidade:

João M.
joao@gmail.com

Match:
98%
```

Mostrar:

```text
[Usar esta identidade]
[Ignorar]
[Procurar outra]
```

Nunca fazer uma associação automática silenciosa quando existir ambiguidade.

---

# 12. IMPORTAÇÃO DE NOVOS UTILIZADORES

Também deve existir o processo inverso.

Na plataforma:

```text
INVOICE
```

clicar:

```text
+ Adicionar utilizador
```

Permitir:

### Opção A

```text
Selecionar utilizador existente
```

### Opção B

```text
Criar nova identidade
```

Assim o administrador pode:

```text
Criar User
      ↓
Selecionar Plataforma
      ↓
Criar acesso
```

---

# 13. SINCRONIZAÇÃO

Criar uma página:

```text
/migration/sync
```

Mostrar:

```text
Plataforma       Total Legacy    Central    Pendentes

INVOICE              1.500        1.420        80
FINANCE              2.300        2.250        50
ACADEMIC             5.400        5.188       212
```

Adicionar:

```text
[Sincronizar plataforma]
```

E:

```text
[Sincronizar todas]
```

---

# 14. HISTÓRICO DE MIGRAÇÕES

Criar:

```text
/migration/history
```

Tabela:

```text
Data
Utilizador
Plataforma
Origem
Destino
Operação
Administrador
Resultado
```

Exemplo:

```text
26/08/2026 10:22
João Manuel
INVOICE
LEGACY → CENTRAL
IMPORT
Admin
SUCESSO
```

Filtros:

```text
Data
Plataforma
Administrador
Resultado
```

---

# 15. API

Criar uma camada de API bem organizada.

Utilizar variáveis de ambiente:

```text
VITE_API_URL
```

Não colocar URLs hardcoded nos componentes.

Criar services/hooks separados:

```text
src/
├── services/
│   ├── users.service.ts
│   ├── platforms.service.ts
│   ├── platform-access.service.ts
│   └── migration.service.ts
│
├── hooks/
│   ├── useUsers.ts
│   ├── usePlatforms.ts
│   ├── usePlatformAccess.ts
│   └── useMigration.ts
```

Preparar os endpoints para uma API NestJS.

Exemplos:

```text
GET    /identity/users
GET    /identity/users/:id
POST   /identity/users
PATCH  /identity/users/:id

GET    /platforms
POST   /platforms
GET    /platforms/:id

POST   /platform-access
DELETE /platform-access/:id

GET    /platform-access/user/:userId
GET    /platform-access/platform/:platformId

GET    /migration/pending
POST   /migration/import
POST   /migration/import/bulk
GET    /migration/history
GET    /migration/platform/:platformId
```

---

# 16. ESTADOS

Utilizar badges consistentes:

```text
ACTIVE       → Ativo
INACTIVE     → Inativo
PENDING      → Pendente
LEGACY       → Legacy
IMPORTED     → Importado
CENTRAL      → Central
FAILED       → Falhou
```

---

# 17. EXPERIÊNCIA DO UTILIZADOR

O sistema deve deixar muito claro:

### Utilizador já centralizado

```text
✓ CENTRAL
```

### Utilizador antigo

```text
⚠ LEGACY
```

### Utilizador antigo já migrado

```text
✓ IMPORTED
```

### Utilizador com acesso à plataforma

```text
● ACTIVE
```

### Utilizador sem acesso

```text
○ INACTIVE
```

---

# 18. REGRAS IMPORTANTES

A aplicação deve tratar Identity e Platform Access como conceitos diferentes.

Um utilizador pode existir na Identity sem possuir nenhuma plataforma.

Um utilizador pode possuir várias plataformas.

Uma plataforma pode possuir milhares de utilizadores.

O mesmo utilizador não pode ser associado duas vezes à mesma plataforma.

A migração de utilizadores Legacy deve preservar o identificador original da plataforma antiga quando a API fornecer esse dado.

Nunca apagar automaticamente um utilizador Legacy durante uma migração.

Quando houver dúvidas sobre correspondência entre utilizadores, exigir confirmação manual.

---

# 19. RESPONSIVIDADE

Desktop deve ser a experiência principal, mas o sistema deve funcionar também em:

- Tablet
- Mobile

No mobile, transformar tabelas grandes em cards ou layouts adaptativos.

---

# 20. RESULTADO ESPERADO

Quero um frontend com aparência de um **produto empresarial real**, e não apenas telas de demonstração.

O fluxo principal deve ser:

```text
                    DASHBOARD
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
      UTILIZADORES  PLATAFORMAS   MIGRAÇÃO
          │             │             │
          ▼             ▼             ▼
       Identity    Platform      Legacy Users
          │             │             │
          └─────────────┼─────────────┘
                        │
                        ▼
                PLATFORM ACCESS
```

O ponto central do sistema é permitir ao administrador gerir facilmente:

**Utilizador → Plataformas**

e também:

**Plataforma → Utilizadores**

incluindo o cenário de:

**Plataformas Legacy → Nova Identity → Platform Access**

Cria o projeto com componentes reutilizáveis, arquitetura organizada, tipagem TypeScript forte, estados de loading/error/empty, paginação, filtros e uma experiência administrativa profissional.

Me gera com dados mocados e depois eu vou alterar .

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/60d9b067-657a-4cd1-bbe3-288e249db01f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
