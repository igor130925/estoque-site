# Sistema de Estoque com Registro por Código Pessoa

## Funcionalidades Principais

1. **Sistema de Registro Simples**
   - Geração automática de código pessoa de 6 dígitos
   - Validação de formulário básica
   - Armazenamento local de usuários

2. **Autenticação Segura**
   - Login com código pessoa e senha
   - Controle de sessão
   - Proteção de rotas

3. **Interface Intuitiva**
   - Transição suave entre login e registro
   - Feedback visual para o usuário
   - Design responsivo

## Como Usar

1. **Registro de Novo Usuário**
   - Acesse a página inicial
   - Clique em "Registre-se aqui"
   - Preencha seu nome
   - Use o código gerado ou clique em "Gerar" para um novo
   - Crie uma senha e confirme
   - Clique em "Registrar"

2. **Login**
   - Insira seu código pessoa de 6 dígitos
   - Digite sua senha
   - Clique em "Entrar"

## Estrutura de Arquivos

- `index.html`: Página de login/registro
- `dashboard.html`: Área logada (protegida)
- `/css`: Estilos da aplicação
- `/js`: Lógica da aplicação

## Personalização

Para alterar o comportamento do sistema:

1. **Código Pessoa**
   - Modifique a função `generatePersonCode()` em `auth.js`
   - Altere o tamanho ou caracteres permitidos

2. **Armazenamento**
   - Substitua as funções no `auth.js` por chamadas a uma API real
   - Implemente criptografia para as senhas