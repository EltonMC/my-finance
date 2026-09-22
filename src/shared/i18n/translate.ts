import { type MessageKey, messages } from './messages';

export function translate(key: MessageKey, parameters: Record<string, string | number> = {}): string {
  return messages[key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in parameters ? String(parameters[name]) : placeholder,
  );
}
