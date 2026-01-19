# Como Solicitar Aprovação de Critical Alerts da Apple

## O que são Critical Alerts?

Critical Alerts são notificações especiais no iOS que:

- ✅ Tocam mesmo com "Não Perturbe" ativado
- ✅ Tocam no volume máximo (ignoram volume do sistema)
- ✅ Não podem ser silenciadas pelo usuário
- ✅ Aparecem de forma mais proeminente

## Casos de Uso Aprovados pela Apple

A Apple aprova Critical Alerts apenas para:

1. **Saúde e Segurança** - Apps médicos, monitoramento de saúde
2. **Segurança Pública** - Alertas de emergência, segurança doméstica
3. **Segurança Pessoal** - Apps de segurança pessoal
4. **Alertas Críticos** - Situações que requerem ação imediata

## Como Justificar para um App de Alarme

### ✅ Argumentos Válidos:

1. **Saúde e Bem-estar**
   - Despertar no horário correto é crítico para saúde do sono
   - Ciclo circadiano afetado por acordar fora do horário
   - Compromete medicação/tratamento que depende de horário

2. **Segurança Pessoal**
   - Pessoas que trabalham em turnos críticos (médicos, bombeiros)
   - Acordar para cuidar de crianças/idosos
   - Compromissos profissionais críticos

3. **Diferenciação do Alarme Nativo**
   - Desafios cognitivos previnem acidentes (sonolência ao dirigir)
   - Método cientificamente comprovado de despertar completo
   - Reduz risco de "soneca perigosa" em profissões críticas

### ❌ Argumentos que NÃO funcionam:

- "Melhor que o alarme nativo"
- "Mais features"
- "Usuários querem"
- "Conveniência"

## Processo de Solicitação

### 1. Preparar Documentação

Crie um documento detalhado incluindo:

```markdown
# WakeMind - Solicitação de Critical Alerts Entitlement

## Propósito do App

WakeMind é um aplicativo de despertar que usa desafios cognitivos
cientificamente comprovados para garantir despertar completo,
prevenindo acidentes causados por sonolência.

## Por que precisamos de Critical Alerts?

### Público-Alvo Crítico

1. Profissionais de saúde em plantões
2. Trabalhadores de turnos em indústrias críticas
3. Pessoas com condições médicas que requerem medicação em horários específicos
4. Pais/cuidadores de pessoas dependentes

### Casos de Uso Crítico

- Acordar para administrar medicação a pacientes
- Despertar para início de plantão médico/segurança
- Garantir despertar completo antes de dirigir (prevenção de acidentes)

### Diferenciação de Alarme Comum

- Desafios cognitivos obrigatórios comprovam despertar completo
- Previne "soneca" que pode causar atrasos críticos
- Monitoramento de performance de despertar para saúde do sono

### Medidas de Proteção ao Usuário

- Usuário deve confirmar uso crítico no primeiro uso
- Limite de alarmes críticos por dia
- Opção de desabilitar critical alerts a qualquer momento
- Educação clara sobre quando usar vs. alarme comum
```

### 2. Contatar a Apple

**Opção 1: Durante Review do App**

1. Submeta o app para review
2. Na seção de capabilities, marque Critical Alerts
3. No campo de notas para review, cole sua justificativa
4. Aguarde resposta (pode levar semanas)

**Opção 2: Antes do Review**

1. Acesse https://developer.apple.com/contact/
2. Escolha "App Review" > "Request Entitlement"
3. Preencha o formulário com sua justificativa
4. Anexe documentação adicional se disponível

### 3. Implementação Técnica

Se aprovado, já está preparado em `withAlarmIOS.js`:

```javascript
// Descomentar após aprovação:
config = withEntitlementsPlist(config, (config) => {
  config.modResults['com.apple.developer.usernotifications.critical-alerts'] = true;
  return config;
});
```

## Alternativas Enquanto Aguarda Aprovação

### 1. Onboarding Educativo

Ensine usuários a:

- Desabilitar "Não Perturbe" durante horário de dormir
- Configurar "Foco" do iOS com exceções
- Aumentar volume antes de dormir

### 2. Live Activities (iOS 16.1+)

- Mostra alarme persistente na tela de bloqueio
- Mais visível que notificações normais
- Não requer aprovação especial

### 3. Widgets de Tela de Bloqueio

- Lembretes visuais do próximo alarme
- Acesso rápido às configurações

### 4. Integração com Atalhos

- Automatizar volume máximo ao configurar alarme
- Desabilitar "Não Perturbe" automaticamente

## Taxa de Aprovação

**Realidade:**

- 📊 ~10-20% de apps de alarme são aprovados
- ⏱️ Processo leva 2-6 semanas
- 🔄 Pode precisar de múltiplas tentativas
- 📝 Justificativa forte é essencial

## Dicas para Aumentar Chances

1. **Foco em casos de uso específicos** - Não tente ser "alarme para todos"
2. **Demonstre responsabilidade** - Mostre como protege usuários
3. **Prove diferenciação** - Explique por que alarme nativo não serve
4. **Dados científicos** - Cite estudos sobre despertar e segurança
5. **Beta testing** - Tenha usuários reais em casos críticos como testemunhas

## Exemplo de Sucesso

Apps aprovados geralmente têm:

- Foco em nicho específico (saúde, profissionais críticos)
- Recursos únicos que alarme nativo não tem
- Sistema de verificação de despertar real
- Documentação médica/científica

## Próximos Passos

1. ✅ Implemente Live Activities primeiro (não requer aprovação)
2. ✅ Crie onboarding educativo sobre configurações iOS
3. ✅ Colete testemunhos de beta testers em profissões críticas
4. ✅ Prepare documentação científica sobre desafios cognitivos
5. 📧 Submeta solicitação à Apple
6. 🔄 Itere baseado no feedback
