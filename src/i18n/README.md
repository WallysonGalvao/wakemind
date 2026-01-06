# Internacionalização (i18n)

## Configuração

O projeto usa **i18next** e **react-i18next** para internacionalização com suporte a 3 idiomas:

- 🇺🇸 **Inglês (en)** - Idioma padrão
- 🇧🇷 **Português (pt/pt-BR)**
- 🇪🇸 **Espanhol (es)**

## Estrutura de Arquivos

```
src/i18n/
├── index.ts              # Configuração principal do i18next
├── en/                   # Traduções em inglês
│   ├── index.ts
│   ├── app.ts
│   ├── accessibility.ts
│   ├── back.ts
│   ├── countries.ts
│   ├── expo.ts
│   ├── quick-actions.ts
│   └── sports.ts
├── pt/                   # Traduções em português
│   └── ...
└── es/                   # Traduções em espanhol
    └── ...
```

## Como Usar

### 1. Em Componentes React

```tsx
import { useTranslation } from '@/hooks/use-translation';

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t('alarms.title')}</Text>;
}
```

### 2. Mudando o Idioma

```tsx
import { useSettingsStore } from '@/stores/use-settings-store';

function LanguageSelector() {
  const { setLanguage } = useSettingsStore();

  return (
    <Button onPress={() => setLanguage('pt')}>
      Português
    </Button>
  );
}
```

## Detecção Automática de Idioma

O sistema detecta automaticamente o idioma do dispositivo usando `expo-localization` e seleciona o idioma correspondente. Se o idioma do sistema não for suportado, usa inglês como fallback.

## Adicionando Novas Traduções

### 1. Adicionar chave em `en/app.ts`:

```tsx
export const appEN = {
  'myFeature.title': 'My Feature',
};
```

### 2. Adicionar a mesma chave em `pt/app.ts`:

```tsx
export const appPT = {
  'myFeature.title': 'Minha Funcionalidade',
};
```

### 3. Adicionar a mesma chave em `es/app.ts`:

```tsx
export const appES = {
  'myFeature.title': 'Mi Función',
};
```

### 4. Usar no componente:

```tsx
<Text>{t('myFeature.title')}</Text>
```

## Organização de Chaves

As chaves são organizadas por categoria:

- **app** - Textos gerais da aplicação
- **accessibility** - Labels de acessibilidade
- **back** - Navegação de volta
- **countries** - Nomes de países
- **expo** - Mensagens do Expo
- **quick-actions** - Ações rápidas
- **sports** - Termos relacionados a esportes

## Formatação de Datas

Para formatação de datas, use o **dayjs** que já está configurado para sincronizar com o idioma selecionado:

```tsx
import { dayjs } from '@/configs/dayjs';

const formattedDate = dayjs().format('LL'); // Formato localizado
```

## TypeScript

O hook `useTranslation` é type-safe e todas as chaves são validadas em tempo de compilação.
