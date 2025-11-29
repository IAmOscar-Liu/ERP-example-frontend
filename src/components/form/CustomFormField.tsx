import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  type UseFormStateReturn,
  useWatch,
} from "react-hook-form";

type Option = { label: string; value: string };

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean | ((values: T) => boolean);
  placeholder?: string;
  className?: string;
  fieldClassName?: string;
}

interface InputProps<T extends FieldValues> extends BaseProps<T> {
  type?: "text" | "password" | "email" | "number" | "textarea" | "checkbox";
  min?: number;
  max?: number;
  step?: number;
}

interface SelectOrRadioProps<T extends FieldValues> extends BaseProps<T> {
  type: "select" | "radio";
  options: Option[];
}

type CustomFormFieldProps<T extends FieldValues> =
  | InputProps<T>
  | SelectOrRadioProps<T>;

// ✅ Type for renderInput function parameters
interface RenderInputParams<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<T>;
  props: CustomFormFieldProps<T>;
}

function CustomFormField<T extends FieldValues>(
  props: CustomFormFieldProps<T>,
) {
  const { control, name, label } = props;
  const formValues = useWatch({ control: props.control });
  const isDisabled =
    typeof props.disabled === "function"
      ? props.disabled(formValues as T)
      : (props.disabled ?? false);

  const renderInput = ({ field, fieldState, props }: RenderInputParams<T>) => {
    switch (props.type) {
      case "textarea":
        return (
          <Textarea
            {...field}
            placeholder={props.placeholder}
            className={cn(props.className, {
              "border-red-500": fieldState.invalid,
            })}
            // className={fieldState.invalid ? "border-red-500" : ""}
            disabled={isDisabled}
          />
        );

      case "number":
        return (
          <Input
            {...field}
            type="number"
            placeholder={props.placeholder}
            min={props.min}
            max={props.max}
            step={props.step === undefined ? "any" : props.step}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value === "" ? "" : Number(value));
            }}
            className={cn(props.className, {
              "border-red-500": fieldState.invalid,
            })}
            // className={fieldState.invalid ? "border-red-500" : ""}
            disabled={isDisabled}
          />
        );

      case "password": {
        const [show, setShow] = useState(false);

        return (
          <div className="relative">
            <Input
              {...field}
              type={show ? "text" : "password"}
              placeholder={props.placeholder}
              className={cn("pr-10", props.className, {
                "border-red-500": fieldState.invalid,
              })}
              // className={fieldState.invalid ? "border-red-500 pr-10" : "pr-10"}
              disabled={isDisabled}
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-sm"
              tabIndex={-1}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      }

      case "select":
        return (
          <Select
            onValueChange={field.onChange}
            // defaultValue={field.value}
            value={field.value}
            disabled={isDisabled}
          >
            <SelectTrigger
              className={cn("w-full", props.className, {
                "border-red-500": fieldState.invalid,
              })}
            >
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            onValueChange={field.onChange}
            // defaultValue={field.value}
            value={field.value}
            className={cn("flex space-x-4", props.className)}
            disabled={isDisabled}
          >
            {props.options.map((option) => (
              <FormItem
                key={option.value}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem
                  id={`radio-${field.name}-${option.value}`}
                  value={option.value}
                />
                <FormLabel
                  htmlFor={`radio-${field.name}-${option.value}`}
                  className="font-normal"
                >
                  {option.label}
                </FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className={cn("flex items-center space-x-2", props.className)}>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isDisabled}
              id={`checkbox-${field.name}`}
            />
            <FormLabel
              htmlFor={`checkbox-${field.name}`}
              className="font-normal"
            >
              {props.label}
            </FormLabel>
          </div>
        );

      default:
        return (
          <Input
            {...field}
            type={props.type || "text"}
            placeholder={props.placeholder}
            className={cn(props.className, {
              "border-red-500": fieldState.invalid,
            })}
            // className={fieldState.invalid ? "border-red-500" : ""}
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => (
        <FormItem className={props.fieldClassName}>
          {props.type !== "checkbox" && label && (
            <CustomFormLabel label={label} required={props.required} />
          )}
          <FormControl>
            {renderInput({ field, fieldState, formState, props })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CustomFormLabel({
  required = false,
  label,
  ...rest
}: Parameters<typeof FormLabel>[0] & { label: string; required?: boolean }) {
  return (
    <FormLabel {...rest}>
      {label} {required && <span className="text-red-500">*</span>}
    </FormLabel>
  );
}

export default CustomFormField;
