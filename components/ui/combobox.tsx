"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const services = [
    "CLEANING",
    "PLUMBING",
    "ELECTRICAL",
    "CARPENTRY",
    "PAINTING",
    "DECOR",
    "HOME_CARE",
    "BABYSITTING",
    "NURSING",
    "ELDERLY_CARE",
    "GARDENING",
    "SECURITY",
    "OTHER",
  ];

export function Combobox({
  onValueChange,
}: {
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? services.find((service) => service === value)
            : "Select service..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search service..." />
          <CommandList>
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {services.map((service) => (
                <CommandItem
                  key={service}
                  value={service}
                  onSelect={(currentValue) => {
                    const cvalue = currentValue === value ? "" : currentValue;
                    setValue(cvalue);
                    onValueChange(cvalue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === service ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {service}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
