import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function InputWithLabel(props: {
  type: string;
  text: string;
  id: string;
  placeholder: string;
  value?: string;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col w-full max-w-sm gap-1.5">
      <Label
        htmlFor={props.id}
        className="text-sm text-left ml-0.5 leading-none"
      >
        {props.text}
      </Label>
      <Input
        type={props.type}
        id={props.id}
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
        required={props.required}
      />
    </div>
  );
}
