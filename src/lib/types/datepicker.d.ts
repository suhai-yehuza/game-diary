declare module 'react-datepicker' {
  import { ComponentType } from 'react';

  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null) => void;
    className?: string;
    dateFormat?: string;
    minDate?: Date;
    maxDate?: Date;
    showTimeSelect?: boolean;
    timeFormat?: string;
    timeIntervals?: number;
    timeCaption?: string;
    todayButton?: string;
    placeholderText?: string;
    isClearable?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    autoComplete?: string;
    [key: string]: any;
  }

  const DatePicker: ComponentType<ReactDatePickerProps>;
  export default DatePicker;
} 