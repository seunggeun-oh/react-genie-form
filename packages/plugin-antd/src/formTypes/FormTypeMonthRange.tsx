import * as React from 'react';
import { useMemo, useState } from 'react';
import { DatePicker } from 'antd';
import moment, { Moment } from 'moment';
import { useHandle } from '../hooks';

const dateFormat = 'YYYY-MM';

const mode = ['month', 'month'];

function FormTypeMonthRange({ size, name, value, onChange }: any) {
  const handleChange = useHandle(([start, end]: [Moment, Moment]) => {
    onChange([
      start ? start.format(dateFormat) : start,
      end ? end.format(dateFormat) : end,
    ]);
  });
  const _value: any = useMemo(
    () =>
      (Array.isArray(value) && value.length === 2
        ? value
        : [undefined, undefined]
      ).map((e) => {
        const f = moment(e, dateFormat);
        return f.isValid() ? f : undefined;
      }),
    [value],
  );
  return (
    <DatePicker.RangePicker
      size={size}
      name={name}
      format={dateFormat}
      value={_value}
      mode={mode}
      onChange={handleChange}
      onPanelChange={handleChange}
    />
  );
}

export default FormTypeMonthRange;