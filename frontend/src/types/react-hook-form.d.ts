declare module "react-hook-form" {
  export const useForm;
  export type FieldValues = Record<string, unknown>;
  export interface UseFormReturn<
    TFieldValues extends FieldValues = FieldValues
  > {
    watch: (name?: string) => unknown;
    setValue: (name: string, value: unknown) => void;
    handleSubmit: (onSubmit: (data: TFieldValues) => void) => (e: unknown) => void;
    control: unknown;
  }
}
