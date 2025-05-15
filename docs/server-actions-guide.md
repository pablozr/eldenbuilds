# Guia de Implementação do Padrão useServerAction

Este documento fornece orientações sobre como implementar o padrão `useServerAction` em todo o projeto. Este padrão padroniza como lidamos com server actions no Next.js, garantindo validação, tratamento de erros e feedback consistentes para o usuário.

## Visão Geral

O padrão `useServerAction` consiste em duas partes principais:

1. **Server-side**: Utilitário `createServerAction` para criar server actions padronizadas
2. **Client-side**: Hook `useServerAction` para consumir essas server actions nos componentes

## Passo a Passo para Migração

### 1. Identificar Server Actions Existentes

Identifique todas as server actions existentes no projeto. Elas geralmente estão em arquivos com a diretiva `'use server'` no topo, frequentemente em pastas chamadas `actions`.

### 2. Refatorar Server Actions

Para cada server action, siga estes passos:

1. Importe o utilitário `createServerAction`:
   ```typescript
   import { createServerAction } from "@/lib/server/createServerAction";
   import { z } from "zod";
   ```

2. Defina schemas Zod para entrada e saída:
   ```typescript
   const inputSchema = z.object({
     // Defina os campos de entrada e suas validações
     field1: z.string().min(1, "Campo obrigatório"),
     field2: z.number().min(0, "Deve ser positivo"),
   });

   const outputSchema = z.object({
     // Defina a estrutura da resposta
     id: z.string(),
     name: z.string(),
     // outros campos...
   });
   ```

3. Converta a server action para usar o utilitário:
   ```typescript
   export const myAction = createServerAction({
     input: inputSchema,
     output: outputSchema,
     handler: async (validatedData) => {
       // Lógica da server action
       // ...
       
       // Retorne dados que correspondam ao outputSchema
       return {
         id: "123",
         name: "Exemplo",
         // outros campos...
       };
     },
   });
   ```

### 3. Refatorar Componentes do Cliente

Para cada componente que usa server actions, siga estes passos:

1. Importe o hook `useServerAction`:
   ```typescript
   import { useServerAction } from "@/lib/hooks/useServerAction";
   import { z } from "zod";
   ```

2. Defina os mesmos schemas Zod (ou importe-os do arquivo da server action):
   ```typescript
   const inputSchema = z.object({
     field1: z.string().min(1, "Campo obrigatório"),
     field2: z.number().min(0, "Deve ser positivo"),
   });

   const outputSchema = z.object({
     id: z.string(),
     name: z.string(),
     // outros campos...
   });
   ```

3. Use o hook no componente:
   ```typescript
   const { 
     execute, 
     isLoading, 
     data, 
     error, 
     validationErrors,
     reset 
   } = useServerAction({
     input: inputSchema,
     output: outputSchema,
     handler: myAction,
     onSuccess: (data) => {
       // Lógica para executar após sucesso
       console.log('Sucesso:', data);
     },
     onError: (error, validationErrors) => {
       // Lógica para executar após erro
       console.error('Erro:', error, validationErrors);
     },
   });
   ```

4. Substitua as chamadas diretas à server action:
   ```typescript
   // Antes
   const result = await myAction({ field1: "valor", field2: 42 });

   // Depois
   const result = await execute({ field1: "valor", field2: 42 });
   ```

5. Use os estados para feedback ao usuário:
   ```tsx
   <button disabled={isLoading}>
     {isLoading ? 'Processando...' : 'Enviar'}
   </button>
   
   {error && <p className="text-red-500">{error}</p>}
   
   {validationErrors && validationErrors.length > 0 && (
     <div className="text-red-500">
       {validationErrors.map((err, i) => (
         <p key={i}>{err.message}</p>
       ))}
     </div>
   )}
   ```

## Exemplos Práticos

### Exemplo 1: Server Action de Comentário

**Server-side (app/builds/[id]/actions/comment.ts)**:
```typescript
'use server';

import { createServerAction } from "@/lib/server/createServerAction";
import { z } from "zod";

// Schemas
const commentInputSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  buildId: z.string(),
});

const commentOutputSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    imageUrl: z.string().nullable(),
  }),
});

// Server action
export const addComment = createServerAction({
  input: commentInputSchema,
  output: commentOutputSchema,
  handler: async (validatedData) => {
    // Lógica para adicionar comentário
    // ...
    
    return {
      id: "123",
      content: validatedData.content,
      createdAt: new Date().toISOString(),
      user: {
        id: "user123",
        username: "usuário",
        imageUrl: null,
      },
    };
  },
});
```

**Client-side (app/builds/[id]/components/comments-section.tsx)**:
```tsx
'use client';

import { useServerAction } from "@/lib/hooks/useServerAction";
import { addComment } from "../actions/comment";
import { z } from "zod";

// Mesmo schema usado na server action
const commentInputSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  buildId: z.string(),
});

const commentOutputSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    imageUrl: z.string().nullable(),
  }),
});

export default function CommentsSection({ buildId }) {
  const [newComment, setNewComment] = useState('');
  
  const { 
    execute, 
    isLoading, 
    error, 
    validationErrors 
  } = useServerAction({
    input: commentInputSchema,
    output: commentOutputSchema,
    handler: addComment,
    onSuccess: (data) => {
      setNewComment('');
      // Atualizar lista de comentários
    },
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute({ content: newComment, buildId });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulário */}
    </form>
  );
}
```

## Benefícios

- **Consistência**: Todas as server actions seguem o mesmo padrão
- **Validação**: Validação automática de entrada e saída
- **Tratamento de Erros**: Tratamento padronizado de erros
- **Feedback ao Usuário**: Estados de carregamento e mensagens de erro
- **Tipagem**: Suporte completo a TypeScript

## Próximos Passos

1. Identifique todas as server actions restantes no projeto
2. Priorize as mais usadas ou críticas
3. Refatore gradualmente, testando cada mudança
4. Atualize a documentação conforme necessário
