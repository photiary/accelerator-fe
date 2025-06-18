# React Style Guide for Application

This document outlines the coding standards, architectural patterns, and best practices for the Dashboard app.

## Technology Stack

### Frontend

- **TypeScript** for language
- **React v19** for building user interfaces
- **Next v15**: The React Framework for the Web
- **Tailwindcss v4** for utility-first styling
- **dayjs** for Date util
- **shadcn/ui** is a set of beautifully-designed, accessible components and a code distribution platform.

### Testing

- **axios-mock-adapter** for Mocking an API request
- **Storybook v8** for a UI Component test framework
- Test script

```shell
pnpm test
```

### Excluded Technologies

- **DO NOT use Jest**: use vitest instead
- **DO NOT use `Date()`**: use dayjs instead

### Excluded Prompt

Ignore the `*.prompt.md` resources defined in `./prompt.ignore`.

## Architectural Patterns

### Package Structure

**Monorepo.**

```
root/
├─ apps/
│  └─ web/
│     ├─ app                   # Page components & Layout components
│     │  └─ {domain}           # Feature domain (Feature Page, Feature API Call)
│     ├─ components            # Business logic common components
│     ├─ hooks
│     └─ lib                   # Utils
│         ├─ api.ts            # Axios
│         └─ axiosInstances.ts
└─ packages/
   └─ ui/
      └─ src/
         └─ components/        # UI Common components (shadcn/ui) and None business components
```

### Layered Architecture

The application follows a strict layered architecture with a clear flow of control

- **API call Layer**: Backend Http request API call, use the Axios defined in `../apps/web/lib/api.ts`
- **UI Component Layer**: Contains the visual components presented to users, including buttons, forms, and layouts.

The flow of control should always follow the pattern:

1. This file: `./prompts/guideline.prompt.md`
2. API call Layer: `./prompts/api.prompt.md`

## Common Rules

- All props, params, and strings can contain **KOREAN**.

## Final task plan

All tasks are done and **Should be RUN** the prettier script.

```shell
# Prettier script
pnpm format
```
