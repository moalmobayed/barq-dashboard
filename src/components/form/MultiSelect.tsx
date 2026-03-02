import React, { useState, useEffect, useRef, useCallback } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  placeholder?: string;
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  placeholder,
  defaultSelected = [],
  onChange,
  disabled = false,
  required = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Focus the input when dropdown opens
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [disabled]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      const willOpen = !prev;
      if (willOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        setSearchQuery("");
      }
      return willOpen;
    });
  }, [disabled]);

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || "",
  );

  const filteredOptions = options.filter((option) =>
    option.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContainerClick = () => {
    openDropdown();
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the parent div click from also firing
    toggleDropdown();
  };

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
        {required && <span className="text-error-500 ms-1">*</span>}
      </label>

      <div className="relative z-20 inline-block w-full" ref={dropdownRef}>
        <div className="relative flex flex-col items-center">
          <div onClick={handleContainerClick} className="w-full">
            <div
              className={`shadow-theme-xs mb-2 flex rounded-lg border py-1.5 ps-3 pe-3 outline-hidden transition ${
                isFocused
                  ? "border-brand-300 ring-brand-500/10 dark:border-brand-800 ring-3"
                  : "border-gray-300 dark:border-gray-700"
              } dark:bg-gray-900`}
            >
              <div className="flex flex-auto flex-wrap items-center gap-2">
                {selectedValuesText.map((text, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 ps-2.5 pe-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                  >
                    <span className="max-w-full flex-initial">{text}</span>
                    <div className="flex flex-auto flex-row-reverse">
                      <div
                        onClick={(e) => removeOption(selectedOptions[index], e)}
                        className="cursor-pointer ps-2 text-gray-500 group-hover:text-gray-400 dark:text-gray-400"
                      >
                        <svg
                          className="fill-current"
                          role="button"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                <input
                  ref={inputRef}
                  placeholder={
                    selectedOptions.length > 0
                      ? ""
                      : placeholder || "اختر اختيارًا"
                  }
                  className="h-full min-w-[60px] flex-1 appearance-none border-0 bg-transparent p-1 pe-2 text-sm outline-hidden placeholder:text-gray-400 focus:border-0 focus:ring-0 focus:outline-hidden dark:text-white/90 dark:placeholder:text-white/30"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isOpen) setIsOpen(true);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    // Delay blur to allow click on dropdown items
                    setTimeout(() => setIsFocused(false), 150);
                  }}
                  disabled={disabled}
                />
              </div>
              <div className="flex w-7 items-center py-1 ps-1 pe-1">
                <button
                  type="button"
                  onClick={handleArrowClick}
                  className="h-5 w-5 text-gray-700 outline-hidden focus:outline-hidden dark:text-gray-400"
                >
                  <svg
                    className={`stroke-current transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isOpen && (
            <div
              className="absolute start-0 top-full z-40 max-h-[200px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <div key={index}>
                      <div
                        className={`w-full cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                          index === 0 ? "rounded-t-lg" : ""
                        } ${index === filteredOptions.length - 1 ? "rounded-b-lg border-b-0" : ""}`}
                        onClick={() => handleSelect(option.value)}
                      >
                        <div
                          className={`relative flex w-full items-center p-2 ps-2 ${
                            selectedOptions.includes(option.value)
                              ? "bg-brand-50 dark:bg-brand-900/20"
                              : ""
                          }`}
                        >
                          <div className="mx-2 leading-6 text-gray-800 dark:text-white/90">
                            {option.text}
                          </div>
                          {selectedOptions.includes(option.value) && (
                            <svg
                              className="text-brand-500 ms-auto me-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-400 dark:text-white/30">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;
