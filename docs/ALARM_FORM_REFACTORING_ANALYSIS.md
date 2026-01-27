# Análise de Refatoração: alarm-form.tsx

**Data:** 27 de Janeiro de 2026  
**Arquivo:** `src/features/alarms/screens/alarm-form.tsx`  
**Linhas de Código:** ~550 linhas

---

## 📊 Resumo Executivo

O componente `AlarmFormScreen` apresenta **oportunidades significativas de melhoria** em todos os critérios analisados. Com 550+ linhas, o componente viola o princípio de responsabilidade única e mistura UI, lógica de negócio, validações e gerenciamento de estado.

**Impacto Estimado da Refatoração:**

- ✅ **Testabilidade:** +80% (lógica extraída permite unit tests)
- ✅ **Manutenibilidade:** +70% (código mais modular e organizado)
- ✅ **Performance:** +30% (otimizações de re-render e memoização)
- ✅ **Reutilização:** +60% (utils e hooks podem ser usados em outros componentes)

---

## 🔴 Problemas Críticos (Alta Prioridade)

### 1. **Violação do Princípio DRY**

#### 1.1 Helper Functions no Componente

```typescript
// ❌ PROBLEMA: Funções utilitárias definidas dentro do componente
const getCurrentDayOfWeek = (): DayOfWeek => { ... }
const getScheduleLabel = (days: DayOfWeek[]): string => { ... }
const parseScheduleToDays = (schedule: string): DayOfWeek[] => { ... }
```

**Impacto:**

- Não podem ser testadas isoladamente
- Não podem ser reutilizadas em outros componentes
- Aumentam complexidade do arquivo

**Solução:**

```typescript
// ✅ SOLUÇÃO: Extrair para utils
// src/features/alarms/utils/schedule-utils.ts
export const scheduleUtils = {
  getCurrentDayOfWeek,
  getScheduleLabel,
  parseScheduleToDays,
  // Adicionar testes unitários
};
```

#### 1.2 Toast Duplicado

```typescript
// ❌ PROBLEMA: Estrutura de toast repetida 5+ vezes
toast.show({
  placement: 'top',
  duration: 3000,
  render: ({ id }) => (
    <Toast nativeID={`toast-${id}`} action="error" variant="solid">
      <ToastTitle>{title}</ToastTitle>
      <ToastDescription>{description}</ToastDescription>
    </Toast>
  ),
});
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Hook customizado
// src/hooks/use-toast-notification.ts
export const useToastNotification = () => {
  const toast = useToast();

  return {
    showError: (title: string, description: string) => { ... },
    showWarning: (title: string, description: string) => { ... },
    showSuccess: (title: string, description: string) => { ... },
  };
};
```

#### 1.3 Constantes Globais no Arquivo

```typescript
// ❌ PROBLEMA: Constantes que devem ser compartilhadas
const CHALLENGE_ICONS: Record<ChallengeType, string> = { ... };
const DAY_ABBREV: Record<DayOfWeek, string> = { ... };
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Constants file
// src/features/alarms/constants/alarm-constants.ts
export const CHALLENGE_ICONS = { ... };
export const DAY_ABBREVIATIONS = { ... };
export const SCHEDULE_PRESETS = {
  DAILY: 'Daily',
  WEEKDAYS: 'Weekdays',
  WEEKENDS: 'Weekends',
} as const;
```

---

### 2. **Baixa Testabilidade**

#### 2.1 Lógica de Negócio Misturada com UI

```typescript
// ❌ PROBLEMA: Validação inline impossível de testar
const onSubmit = async (data: AlarmFormData) => {
  // 1️⃣ Validação de tempo
  if (typeof data.hour !== 'number' || ...) { ... }

  // 2️⃣ Verificação de dificuldade
  if (!canUseDifficulty(data.difficulty)) { ... }

  // 3️⃣ Limite de alarmes
  if (!isEditMode && !canCreateAlarm(alarms.length)) { ... }

  // ... mais 4 validações
};
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Validators separados e testáveis
// src/features/alarms/validators/alarm-validators.ts
export const validateAlarmTime = (hour: number, minute: number): ValidationResult => {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { valid: false, error: 'validation.alarm.invalidHour' };
  }
  // ...
  return { valid: true };
};

export const validateAlarmCreation = (
  isEditMode: boolean,
  alarmsCount: number,
  canCreate: boolean
): ValidationResult => {
  if (!isEditMode && !canCreate) {
    return { valid: false, error: 'featureGate.unlimitedAlarms' };
  }
  return { valid: true };
};

// Test example
describe('validateAlarmTime', () => {
  it('should reject invalid hours', () => {
    expect(validateAlarmTime(-1, 0).valid).toBe(false);
    expect(validateAlarmTime(24, 0).valid).toBe(false);
  });
});
```

#### 2.2 Hook para Lógica de Negócio

```typescript
// ✅ SOLUÇÃO: Custom hook
// src/features/alarms/hooks/use-alarm-form-logic.ts
export const useAlarmFormLogic = (alarmId?: string) => {
  const { alarms, refetch } = useAlarms();
  const toast = useToastNotification();
  const permissions = useAlarmPermissions();

  const createOrUpdateAlarm = async (data: AlarmFormData) => {
    // Toda lógica de criação/atualização
  };

  const validateAndSubmit = async (data: AlarmFormData) => {
    // Orquestração de validações
    const timeValidation = validateAlarmTime(data.hour, data.minute);
    if (!timeValidation.valid) {
      toast.showError(t(timeValidation.error));
      return;
    }
    // ...
  };

  return {
    createOrUpdateAlarm,
    validateAndSubmit,
    isLoading,
  };
};
```

---

### 3. **Race Conditions e Memory Leaks**

#### 3.1 Estado Pendente Sem Limpeza

```typescript
// ❌ PROBLEMA: pendingAlarmData não é limpo em todos os cenários
const [pendingAlarmData, setPendingAlarmData] = useState<AlarmFormData | null>(null);

const handlePermissionsComplete = useCallback(async () => {
  setShowPermissionsModal(false);
  await checkPermissions();

  if (pendingAlarmData) {
    await createAlarm(pendingAlarmData);
    setPendingAlarmData(null); // ✅ Limpa aqui
  }
}, [checkPermissions, pendingAlarmData]);

// ❌ Mas se o modal for fechado sem completar?
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Cleanup em useEffect
useEffect(() => {
  return () => {
    // Cleanup ao desmontar
    setPendingAlarmData(null);
  };
}, []);

const handleModalClose = () => {
  setShowPermissionsModal(false);
  setPendingAlarmData(null); // Limpa ao fechar
};
```

#### 3.2 Múltiplos Submits Possíveis

```typescript
// ❌ PROBLEMA: Usuário pode clicar múltiplas vezes no botão
<Pressable onPress={handleSubmit(onSubmit)}>
  <Text>{commitButtonText}</Text>
</Pressable>
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Loading state e debounce
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: AlarmFormData) => {
  if (isSubmitting) return; // Previne múltiplos submits

  setIsSubmitting(true);
  try {
    await createAlarm(data);
  } finally {
    setIsSubmitting(false);
  }
};

<Pressable
  onPress={handleSubmit(onSubmit)}
  disabled={isSubmitting}
>
  <Text>{isSubmitting ? 'Saving...' : commitButtonText}</Text>
</Pressable>
```

#### 3.3 Navigation sem Verificação de Mounted

```typescript
// ❌ PROBLEMA: router.back() pode ser chamado após unmount
const handleDelete = useCallback(async () => {
  if (alarmId) {
    await alarmsDb.deleteAlarm(alarmId);
    await refetch();
    router.back(); // ⚠️ E se o componente foi desmontado?
  }
}, [alarmId, refetch, router]);
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: useIsMounted hook
const isMounted = useIsMounted();

const handleDelete = useCallback(async () => {
  if (alarmId) {
    await alarmsDb.deleteAlarm(alarmId);
    await refetch();
    if (isMounted()) {
      router.back();
    }
  }
}, [alarmId, refetch, router, isMounted]);
```

---

### 4. **Performance e 60fps**

#### 4.1 Re-renders Desnecessários

```typescript
// ❌ PROBLEMA: 6 watch() calls causam re-render em cada mudança
const hour = watch('hour');
const minute = watch('minute');
const selectedDays = watch('selectedDays');
const challenge = watch('challenge');
const difficulty = watch('difficulty');
const protocols = watch('protocols');
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Usar useWatch com subscription otimizada
const formValues = useWatch({
  control,
  name: ['hour', 'minute', 'selectedDays', 'challenge', 'difficulty', 'protocols'],
});

const [hour, minute, selectedDays, challenge, difficulty, protocols] = formValues;

// Ou ainda melhor: derivar valores apenas quando necessário
const displayTime = useMemo(
  () => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  [hour, minute]
);
```

#### 4.2 Toast Components Inline

```typescript
// ❌ PROBLEMA: Cria novo componente a cada toast
toast.show({
  render: ({ id }) => (
    <Toast nativeID={`toast-${id}`} action="error" variant="solid">
      <ToastTitle>{title}</ToastTitle>
      <ToastDescription>{description}</ToastDescription>
    </Toast>
  ),
});
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Componente memoizado
const ToastError = memo(({ id, title, description }: ToastErrorProps) => (
  <Toast nativeID={`toast-${id}`} action="error" variant="solid">
    <ToastTitle>{title}</ToastTitle>
    <ToastDescription>{description}</ToastDescription>
  </Toast>
));

toast.show({
  render: ({ id }) => <ToastError id={id} title={title} description={description} />
});
```

#### 4.3 UseMemo com Dependências Pesadas

```typescript
// ❌ PROBLEMA: alarms array completo como dependência
const defaultValues = useMemo((): AlarmFormData => {
  if (isEditMode && alarmId) {
    const existingAlarm = alarms.find((a) => a.id === alarmId);
    // ...
  }
}, [alarmId, isEditMode, alarms]); // alarms causa re-compute desnecessário
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Memorizar apenas o alarme específico
const currentAlarm = useMemo(() => alarms.find((a) => a.id === alarmId), [alarms, alarmId]);

const defaultValues = useMemo((): AlarmFormData => {
  if (isEditMode && currentAlarm) {
    // Usar currentAlarm
  }
}, [alarmId, isEditMode, currentAlarm]); // Dependência mais específica
```

---

## 🟡 Problemas Moderados (Média Prioridade)

### 5. **Type Safety**

#### 5.1 Casting Sem Validação

```typescript
// ❌ PROBLEMA: parseInt sem verificação
const [hourStr, minuteStr] = existingAlarm.time.split(':');
return {
  hour: parseInt(hourStr, 10), // E se hourStr for undefined?
  minute: parseInt(minuteStr, 10),
};
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Type guard e validação
const parseTimeString = (timeString: string): { hour: number; minute: number } | null => {
  const parts = timeString.split(':');
  if (parts.length !== 2) return null;

  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
};

// Uso
const timeData = parseTimeString(existingAlarm.time);
if (!timeData) {
  // Handle invalid time
  return getDefaultAlarmFormValues();
}
return { ...defaultValues, ...timeData };
```

#### 5.2 String Literals como Magic Strings

```typescript
// ❌ PROBLEMA: Strings mágicas espalhadas
if (schedule === 'Daily') { ... }
if (schedule === 'Weekdays') { ... }
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Enum ou const assertion
export const SchedulePreset = {
  DAILY: 'Daily',
  WEEKDAYS: 'Weekdays',
  WEEKENDS: 'Weekends',
} as const;

export type SchedulePresetType = typeof SchedulePreset[keyof typeof SchedulePreset];

// Uso
if (schedule === SchedulePreset.DAILY) { ... }
```

---

### 6. **Consistência**

#### 6.1 Mistura de Formatos de Hora

```typescript
// ❌ PROBLEMA: Conversão de hora em múltiplos lugares
const timeString = `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;
// Em outro lugar:
const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Utility functions
// src/utils/time-format.ts
export const formatTime24h = (hour: number, minute: number): string =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

export const formatTime12h = (hour: number, minute: number): string => {
  const period = hour < 12 ? Period.AM : Period.PM;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};
```

---

## 🟢 Melhorias Recomendadas (Baixa Prioridade)

### 7. **Escalabilidade**

#### 7.1 Componente Monolítico

```typescript
// ❌ PROBLEMA: 550+ linhas em um único componente
export default function AlarmFormScreen({ alarmId }: AlarmFormScreenProps) {
  // Toda a lógica aqui
}
```

**Solução:**

```typescript
// ✅ SOLUÇÃO: Composição de componentes
// alarm-form.tsx (componente container - ~100 linhas)
export default function AlarmFormScreen({ alarmId }: AlarmFormScreenProps) {
  const { formMethods, handlers } = useAlarmFormLogic(alarmId);

  return (
    <AlarmFormLayout>
      <AlarmFormHeader {...} />
      <AlarmFormContent formMethods={formMethods} />
      <AlarmFormActions handlers={handlers} />
    </AlarmFormLayout>
  );
}

// alarm-form-content.tsx (~150 linhas)
// alarm-form-header.tsx (~50 linhas)
// alarm-form-actions.tsx (~80 linhas)
```

---

## 📋 Plano de Implementação

### Fase 1: Fundação (1-2 dias)

- [ ] Criar `src/features/alarms/utils/schedule-utils.ts`
- [ ] Criar `src/features/alarms/utils/time-utils.ts`
- [ ] Criar `src/features/alarms/constants/alarm-constants.ts`
- [ ] Criar `src/features/alarms/validators/alarm-validators.ts`
- [ ] Adicionar testes unitários para utils e validators

### Fase 2: Hooks e Lógica (2-3 dias)

- [ ] Criar `src/hooks/use-toast-notification.ts`
- [ ] Criar `src/hooks/use-is-mounted.ts`
- [ ] Criar `src/features/alarms/hooks/use-alarm-form-logic.ts`
- [ ] Migrar lógica de negócio do componente para hook
- [ ] Adicionar loading states e error handling

### Fase 3: Performance (1 dia)

- [ ] Otimizar watch() para useWatch
- [ ] Memoizar componentes Toast
- [ ] Adicionar React.memo em sub-componentes
- [ ] Implementar debounce no submit

### Fase 4: Split de Componentes (2 dias)

- [ ] Criar `AlarmFormLayout`
- [ ] Criar `AlarmFormHeader`
- [ ] Criar `AlarmFormContent`
- [ ] Criar `AlarmFormActions`
- [ ] Ajustar testes

### Fase 5: Refinamento (1 dia)

- [ ] Review de TypeScript strict mode
- [ ] Adicionar JSDoc comments
- [ ] Performance profiling
- [ ] Documentação de uso

---

## 🎯 Métricas de Sucesso

### Antes da Refatoração

- **Linhas de código:** 550
- **Complexidade ciclomática:** ~45
- **Cobertura de testes:** 0%
- **Componentes reutilizáveis:** 0
- **Re-renders por mudança:** 6+

### Após Refatoração (Meta)

- **Linhas de código:** 150 (componente principal)
- **Complexidade ciclomática:** ~10 (por arquivo)
- **Cobertura de testes:** 80%+
- **Componentes reutilizáveis:** 8+
- **Re-renders por mudança:** 1-2

---

## 🔧 Ferramentas Recomendadas

1. **Testes:**
   - Jest + React Testing Library (já configurado)
   - `@testing-library/react-hooks` para testar hooks

2. **Performance:**
   - React DevTools Profiler
   - `why-did-you-render` para debug de re-renders
   - Flipper para performance mobile

3. **Type Safety:**
   - ESLint rules: `@typescript-eslint/strict-boolean-expressions`
   - `ts-reset` para melhores types

4. **Análise de Código:**
   - SonarQube para code smells
   - `eslint-plugin-sonarjs` para detectar problemas

---

## 💡 Exemplo de Código Refatorado

### Antes (onSubmit simplificado):

```typescript
const onSubmit = async (data: AlarmFormData) => {
  if (typeof data.hour !== 'number' || isNaN(data.hour) || ...) {
    toast.show({ ... }); // 15 linhas de toast
    return;
  }

  if (!canUseDifficulty(data.difficulty)) {
    toast.show({ ... }); // Mais 15 linhas
    await requirePremiumAccess('difficulty_selection');
    return;
  }

  // ... mais 4 validações similares

  try {
    if (isEditMode && alarmId) {
      await alarmsDb.updateAlarm(alarmId, { ... });
    } else {
      const newId = randomUUID();
      await alarmsDb.addAlarm(newId, { ... });
    }
    router.back();
  } catch (error) {
    // Error handling
  }
};
```

### Depois (versão refatorada):

```typescript
const onSubmit = async (data: AlarmFormData) => {
  if (isSubmitting) return;

  const validation = await validateAlarmSubmission(data, {
    isEditMode,
    alarmsCount: alarms.length,
    canUseDifficulty,
    canCreateAlarm,
  });

  if (!validation.success) {
    handleValidationError(validation.error);
    return;
  }

  await createOrUpdateAlarm(data);
};
```

**Benefícios:**

- ✅ 80% menos código no componente
- ✅ Validação testável
- ✅ Error handling centralizado
- ✅ Proteção contra race conditions
- ✅ Mais legível e manutenível

---

## 🚀 Próximos Passos

1. **Revisar e aprovar** este plano de refatoração
2. **Criar branch** `refactor/alarm-form`
3. **Implementar Fase 1** (fundação com utils)
4. **Code review** após cada fase
5. **Merge incremental** para evitar conflitos

---

**Estimativa Total:** 7-9 dias de desenvolvimento  
**ROI Esperado:** Alto (melhorias em todos os critérios avaliados)  
**Risco:** Baixo (refatoração incremental com testes)
