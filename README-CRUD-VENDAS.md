# Fluxo didático de CRUD de vendas (Expo + Appwrite)

Este projeto foi adaptado para um exemplo didático com **React Native + Expo Router + Appwrite**.

## Rotas em Bottom Tabs

- `Vendas`: CRUD completo de vendas
- `Produtos`: listagem de produtos
- `Clientes`: listagem de clientes

## Collections usadas (baseado nos prints)

- `cliente`
- `produto`
- `venda`

## Arquivos principais

- `app/(tabs)/_layout.tsx`: configuração das abas
- `app/(tabs)/vendas.tsx`: tela com fluxo de criar, listar, editar e excluir vendas
- `app/(tabs)/produtos.tsx`: listagem de produtos
- `app/(tabs)/clientes.tsx`: listagem de clientes
- `src/services/appwriteCrud.ts`: funções de acesso ao Appwrite (CRUD e listagens)
- `src/lib/appwrite.ts`: cliente e configuração centralizados

## Variáveis de ambiente

No `.env`, confira:

- `EXPO_PUBLIC_APPWRITE_ENDPOINT`
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID`
- `EXPO_PUBLIC_APPWRITE_DATABASE_ID`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_CLIENTES`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_PRODUTOS`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_VENDAS`

E, para mapear os nomes dos campos da venda:

- `EXPO_PUBLIC_APPWRITE_FIELD_SALE_CLIENT`
- `EXPO_PUBLIC_APPWRITE_FIELD_SALE_SELLER`
- `EXPO_PUBLIC_APPWRITE_FIELD_SALE_ITEMS`

## Observação importante sobre o campo itens

Em alguns projetos o nome pode estar como `itens[]` e em outros como `itens`.
Se necessário, ajuste `EXPO_PUBLIC_APPWRITE_FIELD_SALE_ITEMS` no `.env`.
